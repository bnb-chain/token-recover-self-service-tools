import {
  Input,
  Select,
  Button,
  type SelectOption,
} from "@/modules/recover/components";
import { SectionWrapper } from "@/modules/recover/components/SectionWrapper";
import { Strong } from '@/modules/recover/components/Strong';
import { BEACON_CHAIN_DECIMAL } from "@/modules/recover/constants";
import { getSignBytes } from "@/modules/recover/utils/bbcSdk";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { isValidBSCAddress, isValidAmount } from "@/modules/recover/utils/validation";

export const networkMapping = {
  "Beacon Chain Mainnet": "Binance-Chain-Tigris",
  "Beacon Chain Testnet": "Binance-Chain-Ganges",
};

export const BBCSignMessage = () => {
  const [recoverToAddress, setRecoverToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [chainId, setChainId] = useState<string>('Binance-Chain-Tigris');
  const [bytes, setBytes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const networkOptions: SelectOption[] = Object.entries(networkMapping).map(
    ([network, id]) => ({
      value: id,
      label: network,
    })
  );

  return (
    <SectionWrapper title="2. Generate Sign Message for Wallet to Sign (Beacon Chain)">
      <div className="space-y-4">
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
      <Button
        onClick={async () => {
          if (!symbol.trim()) { setError("Token symbol is required."); return; }
          if (!isValidAmount(amount)) { setError("Amount must be a positive number."); return; }
          if (!isValidBSCAddress(recoverToAddress)) { setError("Invalid BSC address. Must be 0x followed by 40 hex characters."); return; }
          setError("");
          const _amount = new BigNumber(amount)
            .multipliedBy(BEACON_CHAIN_DECIMAL)
            .toFixed();
          const bytes = await getSignBytes({
            to: recoverToAddress,
            amount: _amount,
            symbol,
            chainId,
          });
          setBytes(bytes.toString());
        }}
        variant="primary"
      >
        Generate Sign Message
      </Button>
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
          Wallet sign code example:
        </label>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
          <code className="text-gray-800 dark:text-gray-200">
{`// beaconChainAddress: string — the bnb1... Beacon Chain address
// messageToSign: string — the JSON message shown above
// Sign the message with the Beacon Chain wallet (e.g., Trust Wallet)
const bbcSigned = await window.TrustBinanceChain.bnbSign(
  beaconChainAddress,
  messageToSign
);
console.log(bbcSigned);
// Example bbcSigned result:
// {
//   "signature": "0xe4838ff411975a210cb15d5c950b53835f5d5bb7b0ebb8dbc4515541bb01181e408f7cbbdab08c9278a623667909e8c3c39fee8c3df65de65df4aec0c48f4196",
//   "publicKey": "0x030771d42cc0a93289bf457e575bdb42c0d56fcf5953df6614b1b7de2986ce941c"
// }`}
          </code>
        </pre>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> The <code>signature</code> returned by the wallet may not be <code>0x</code>-prefixed.
          Make sure to prepend <code>0x</code> if it&apos;s missing before using the signature in the next steps.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          After signing, you should get a signed result (referred to as <Strong>bbcSigned</Strong> in the next steps),
          containing the wallet&apos;s <code>signature</code> and <code>publicKey</code>. Keep this result — you&apos;ll
          need both fields to request the approval and to recover the asset.
        </p>
      </div>
    </SectionWrapper>
  );
};
