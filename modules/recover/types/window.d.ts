// SPDX-License-Identifier: LicenseRef-Innovation-Enabling

interface TrustBinanceChainAccountAddress {
  type: string;
  address: string;
}

interface TrustBinanceChainAccount {
  id: string;
  name?: string;
  icon?: string;
  addresses: TrustBinanceChainAccountAddress[];
}

interface TrustBinanceChainProvider {
  requestAccounts?: () => Promise<TrustBinanceChainAccount[]>;
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  enable?: () => Promise<unknown>;
  bnbSign?: (
    address: string,
    message: string
  ) => Promise<{ publicKey: string; signature: string }>;
}

interface Window {
  TrustBinanceChain?: TrustBinanceChainProvider;
  BinanceChain?: TrustBinanceChainProvider;
}
