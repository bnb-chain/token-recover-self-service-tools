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
  "bsc-mainnet": "0x38",
  "bsc-testnet": "0x61",
  "bbc-mainnet": "Binance-Chain-Tigris",
  "bbc-testnet": "Binance-Chain-Ganges",
};

export const BBCSignMessage = () => {
  const [recoverToAddress, setRecoverToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [chainId, setChainId] = useState<string>('bbc-mainnet');
  const [bytes, setBytes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const networkOptions: SelectOption[] = Object.entries(networkMapping).map(
    ([network, id]) => ({
      value: id,
      label: network,
    })
  );

  return (
    <SectionWrapper title="2. Input recover params to generate sign message for wallet to sign(beacon chain)">
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
          label="Network(Select bbc-mainnet)"
          value={chainId}
          onChange={setChainId}
          options={networkOptions}
          placeholder="Please select network"
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
        Beacon chain sign message
      </Button>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Bytes:
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
          For wallet to sign code:
        </label>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
          <code className="text-gray-800 dark:text-gray-200">
{`const [_approvalSignature, err1] = await walletProvider?.bnbSign(
  address,
  bytes
);

const approvalSignature = {
  ..._approvalSignature,
  publicKey: _approvalSignature.publicKey,
  // Handle the case where the signature is not prefixed with 0x
  signature: _approvalSignature.signature.startsWith('0x')
    ? _approvalSignature.signature
    : '0x' + _approvalSignature.signature,
};`}
          </code>
        </pre>
      </div>
      <div className="flex flex-col gap-2">
        ===&gt; <Strong>bbcSigned</Strong>
      </div>
    </SectionWrapper>
  );
};
