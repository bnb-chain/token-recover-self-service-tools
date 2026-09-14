// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
import {
  Input,
  Select,
  Button,
  type SelectOption,
} from "@/modules/recover/components";
import { SectionWrapper } from "@/modules/recover/components/SectionWrapper";
import { BEACON_CHAIN_DECIMAL } from "@/modules/recover/constants";
import { getSignBytes } from "@/modules/recover/utils/bbcSdk";
import { signBbcMessage, TrustWalletError } from "@/modules/recover/utils/trustWallet";
import { isValidBBCAddress, isValidBSCAddress, isValidAmount } from "@/modules/recover/utils/validation";
import BigNumber from "bignumber.js";
import { useState } from "react";

export const networkMapping = {
  "Beacon Chain Mainnet": "Binance-Chain-Tigris",
  "Beacon Chain Testnet": "Binance-Chain-Ganges",
};

const WALLET_SIGN_SNIPPET = `// Paste this in the browser console after Generate Sign Message.
// Switch Trust Wallet to the Beacon Chain account (bnb1...) first, then connect.
const provider = window.TrustBinanceChain ?? window.BinanceChain;
await provider.requestAccounts();
// Fallback if requestAccounts is missing:
// await provider.request({ method: "eth_requestAccounts" });

// beaconChainAddress: string — the bnb1... Beacon Chain address from Step 1
// messageToSign: string — the JSON message shown above
const bbcSigned = await provider.bnbSign(
  beaconChainAddress,
  messageToSign
);
// Never print the full signature in production builds.
console.log("Signed; bbcSigned ready");
// Example bbcSigned shape (do not log this in production):
// {
//   "signature": "0x...",
//   "publicKey": "0x..."
// }`;

const isValidBeaconAddress = (address: string, chainId: string): boolean => {
  if (chainId === "Binance-Chain-Ganges") {
    return /^tbnb1[a-z0-9]{38}$/.test(address);
  }
  return isValidBBCAddress(address);
};

export const BBCSignMessage = () => {
  const [recoverToAddress, setRecoverToAddress] = useState<string>("");
  const [beaconChainAddress, setBeaconChainAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [chainId, setChainId] = useState<string>("Binance-Chain-Tigris");
  const [bytes, setBytes] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [signing, setSigning] = useState(false);
  const [signedPublicKey, setSignedPublicKey] = useState<string>("");
  const [signedSignature, setSignedSignature] = useState<string>("");

  const networkOptions: SelectOption[] = Object.entries(networkMapping).map(
    ([network, id]) => ({
      value: id,
      label: network,
    })
  );

  const handleGenerate = async () => {
    if (!symbol.trim()) { setError("Token symbol is required."); return; }
    if (!isValidAmount(amount)) { setError("Amount must be a positive number."); return; }
    if (!isValidBSCAddress(recoverToAddress)) { setError("Invalid BSC address. Must be 0x followed by 40 hex characters."); return; }
    if (!Object.values(networkMapping).includes(chainId)) { setError("Invalid network."); return; }
    setError("");
    setSignedPublicKey("");
    setSignedSignature("");
    // Convert human-readable amount to base units (×10^8 for BEP2/BEP8).
    const _amount = new BigNumber(amount)
      .multipliedBy(BEACON_CHAIN_DECIMAL)
      .toFixed();
    const nextBytes = await getSignBytes({
      to: recoverToAddress,
      amount: _amount,
      symbol,
      chainId,
    });
    setBytes(nextBytes.toString());
  };

  const handleSign = async () => {
    if (!bytes) {
      setError("Generate the sign message first.");
      return;
    }
    const fallback = beaconChainAddress.trim();
    if (fallback && !isValidBeaconAddress(fallback, chainId)) {
      setError(
        chainId === "Binance-Chain-Ganges"
          ? "Invalid Beacon Chain address. Testnet addresses start with tbnb1."
          : "Invalid Beacon Chain address. Must start with bnb1 and be 42 characters long."
      );
      return;
    }
    setError("");
    setSigning(true);
    try {
      const { signed, address } = await signBbcMessage({
        messageToSign: bytes,
        chainId,
        fallbackAddress: fallback || undefined,
      });
      setBeaconChainAddress(address);
      setSignedPublicKey(signed.publicKey);
      setSignedSignature(signed.signature);
    } catch (err) {
      const message =
        err instanceof TrustWalletError
          ? err.message
          : "Failed to sign with Trust Wallet.";
      setError(message);
    } finally {
      setSigning(false);
    }
  };

  return (
    <SectionWrapper title="2. Generate Sign Message for Wallet to Sign (Beacon Chain)">
      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        Before you generate the message or sign, open Trust Wallet and switch to the{" "}
        <strong>Beacon Chain</strong> account — the same <code>bnb1...</code> address you used in
        Step 1. Trust Wallet will not prompt a valid Beacon Chain signature if another network or
        account is selected, and Step 3 will then fail.
      </p>
      <div className="space-y-4">
        <Input
          label="Beacon Chain Address"
          value={beaconChainAddress}
          onChange={setBeaconChainAddress}
          placeholder="Enter your beacon chain address (bnb1...)"
        />
        <Input
          label="Symbol"
          value={symbol}
          onChange={setSymbol}
          placeholder="Enter token symbol"
        />
        <Input
          label="Amount"
          value={amount}
          onChange={setAmount}
          placeholder="Enter amount"
        />
        <Input
          label="To BSC Address"
          value={recoverToAddress}
          onChange={setRecoverToAddress}
          placeholder="Enter recovery address"
        />
        <Select
          label="Network (default: Beacon Chain Mainnet)"
          value={chainId}
          onChange={setChainId}
          options={networkOptions}
          placeholder="Please select a network"
        />
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleGenerate} variant="primary">
          Generate Sign Message
        </Button>
        <Button
          onClick={handleSign}
          variant="secondary"
          disabled={!bytes || signing}
        >
          {signing ? "Waiting for Trust Wallet…" : "Sign with Trust Wallet"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          messageToSign:
        </label>
        <textarea
          rows={3}
          value={bytes}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          publicKey (bbcSigned.publicKey):
        </label>
        <textarea
          rows={2}
          value={signedPublicKey}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          signature (bbcSigned.signature):
        </label>
        <textarea
          rows={3}
          value={signedSignature}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        You can sign with the button above, or paste the console example below. Trust Wallet must
        already be on the Beacon Chain account; the connect call only authorizes this site, then{" "}
        <code>bnbSign</code> opens the sign modal. If the extension is missing, install it from{" "}
        <a
          href="https://trustwallet.com/download"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          trustwallet.com/download
        </a>
        {" "}and disable other wallet extensions.
      </p>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Wallet sign code example (paste in the browser console):
        </label>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
          <code className="text-gray-800 dark:text-gray-200">
            {WALLET_SIGN_SNIPPET}
          </code>
        </pre>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> The <code>signature</code> returned by the wallet may not be <code>0x</code>-prefixed.
          Make sure to prepend <code>0x</code> if it&apos;s missing before using the signature in the next steps.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Security:</strong> <code>window.TrustBinanceChain</code> is a plain global —
          any browser extension can inject or override it (and <code>provider.isTrust</code> can be
          set by anyone). Before signing, make sure only the legitimate Trust Wallet extension is
          enabled and you&apos;re not on a shared/untrusted browser. Avoid signing with multiple
          wallet extensions installed simultaneously.
        </p>
      </div>
    </SectionWrapper>
  );
};
