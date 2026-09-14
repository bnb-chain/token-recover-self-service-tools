// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
/// <reference path="../types/window.d.ts" />

export const TRUST_WALLET_DOWNLOAD_URL = "https://trustwallet.com/download";

const TRUST_WALLET_RDNS = "com.trustwallet.app";
const USER_REJECTED_CODE = 4001;

export type BbcNetwork = "bbc-mainnet" | "bbc-testnet";

export type BbcSigned = {
  publicKey: string;
  signature: string;
};

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type Eip6963ProviderDetail = {
  info?: { rdns?: string };
  provider?: Eip1193Provider;
};

export class TrustWalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrustWalletError";
  }
}

export function chainIdToBbcNetwork(chainId: string): BbcNetwork {
  return chainId === "Binance-Chain-Ganges" ? "bbc-testnet" : "bbc-mainnet";
}

export function ensureHexPrefix(value: string): string {
  return value.startsWith("0x") ? value : `0x${value}`;
}

export function getTrustBinanceChainProvider(): TrustBinanceChainProvider | null {
  if (typeof window === "undefined") return null;
  return window.TrustBinanceChain ?? window.BinanceChain ?? null;
}

export function isUserRejected(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  return code === USER_REJECTED_CODE || code === "4001";
}

function wrapWalletError(error: unknown, rejectedMessage: string): never {
  if (isUserRejected(error)) {
    throw new TrustWalletError(rejectedMessage);
  }
  if (error instanceof TrustWalletError) throw error;
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Trust Wallet request failed.";
  throw new TrustWalletError(message);
}

/** BBC-specific connect: requestAccounts → eth_requestAccounts → enable. */
export async function connectBbcProvider(
  provider: TrustBinanceChainProvider
): Promise<unknown> {
  try {
    if (typeof provider.requestAccounts === "function") {
      return await provider.requestAccounts();
    }
    if (typeof provider.request === "function") {
      return await provider.request({ method: "eth_requestAccounts" });
    }
    if (typeof provider.enable === "function") {
      return await provider.enable();
    }
  } catch (error) {
    wrapWalletError(error, "User rejected the connection request.");
  }
  throw new TrustWalletError(
    "Trust Wallet has no connect method. Update the extension and try again."
  );
}

/**
 * Optional EVM connect via EIP-6963 Trust Wallet provider.
 * Kept separate so it can be inserted before bnbSign without rewriting BBC connect.
 */
export async function connectTrustEvmProvider(): Promise<unknown> {
  const evm = await discoverTrustEvmProvider();
  if (!evm) return null;
  try {
    return await evm.request({ method: "eth_requestAccounts" });
  } catch (error) {
    wrapWalletError(error, "User rejected the connection request.");
  }
}

function discoverTrustEvmProvider(timeoutMs = 300): Promise<Eip1193Provider | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (provider: Eip1193Provider | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      resolve(provider);
    };

    const onAnnounce = (event: Event) => {
      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
      if (detail?.info?.rdns === TRUST_WALLET_RDNS && detail.provider) {
        finish(detail.provider);
      }
    };

    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    window.setTimeout(() => finish(null), timeoutMs);
  });
}

export function bbcAddressFromAccounts(
  accounts: unknown,
  network: BbcNetwork
): string | null {
  if (!Array.isArray(accounts)) return null;
  const prefix = network === "bbc-testnet" ? "tbnb1" : "bnb1";

  const fromTyped = findAddress(accounts, (type, address) => {
    return type === network && address.startsWith(prefix);
  });
  if (fromTyped) return fromTyped;

  return findAddress(accounts, (_type, address) => address.startsWith(prefix));
}

function findAddress(
  accounts: unknown[],
  match: (type: string | undefined, address: string) => boolean
): string | null {
  for (const item of accounts) {
    if (typeof item === "string") {
      if (match(undefined, item)) return item;
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const addresses = (item as { addresses?: unknown }).addresses;
    if (!Array.isArray(addresses)) continue;
    for (const entry of addresses) {
      if (!entry || typeof entry !== "object") continue;
      const type = (entry as { type?: unknown }).type;
      const address = (entry as { address?: unknown }).address;
      if (typeof address !== "string") continue;
      if (match(typeof type === "string" ? type : undefined, address)) {
        return address;
      }
    }
  }
  return null;
}

export async function signBbcMessage(params: {
  messageToSign: string;
  chainId: string;
  fallbackAddress?: string;
}): Promise<{ signed: BbcSigned; address: string }> {
  const provider = getTrustBinanceChainProvider();
  if (!provider) {
    throw new TrustWalletError(
      `Trust Wallet extension was not found. Install it from ${TRUST_WALLET_DOWNLOAD_URL} and disable other wallet extensions so they do not override the injected provider.`
    );
  }
  if (typeof provider.bnbSign !== "function") {
    throw new TrustWalletError(
      "This wallet does not expose bnbSign. Use the Trust Wallet browser extension."
    );
  }

  const accounts = await connectBbcProvider(provider);
  const network = chainIdToBbcNetwork(params.chainId);
  const address =
    bbcAddressFromAccounts(accounts, network) || params.fallbackAddress?.trim() || "";
  if (!address) {
    throw new TrustWalletError(
      "No Beacon Chain address available. Enter your bnb1 address and try again."
    );
  }

  let raw: { publicKey: string; signature: string };
  try {
    raw = await provider.bnbSign(address, params.messageToSign);
  } catch (error) {
    wrapWalletError(error, "User rejected the signature request.");
  }

  if (!raw?.publicKey || !raw?.signature) {
    throw new TrustWalletError("Trust Wallet returned an empty signature.");
  }

  return {
    address,
    signed: {
      publicKey: ensureHexPrefix(raw.publicKey),
      signature: ensureHexPrefix(raw.signature),
    },
  };
}
