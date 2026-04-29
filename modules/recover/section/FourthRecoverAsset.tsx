// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
import { SectionWrapper } from "@/modules/recover/components/SectionWrapper";
import { Input, Button } from "@/modules/recover/components";
import { strTo32Bytes } from "@/modules/recover/utils/number";
import { ethers } from "ethers";
import { useState } from "react";
import { BEACON_CHAIN_DECIMAL } from "@/modules/recover/constants";
import BigNumber from "bignumber.js";
import { Strong } from "@/modules/recover/components/Strong";
import { isValidPublicKey, isValidHexSignature, isValidAmount, isValidMerkleProof } from "@/modules/recover/utils/validation";

type RecoverPayload = {
  tokenSymbol: string;
  amount: string;
  ownerSignature: string;
  ownerPubKey: string;
  approvalSignature: string;
  merkleProof: string[];
};

export const RecoverAsset = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [ownerSignature, setOwnerSignature] = useState<string>("");
  const [ownerPubKey, setOwnerPubKey] = useState<string>("");
  const [approvalSignature, setApprovalSignature] = useState<string>("");
  const [merkleProof, setMerkleProof] = useState<string>("[]");
  const [generatedPayload, setGeneratedPayload] = useState<RecoverPayload | null>(null);
  const [error, setError] = useState<string>("");

  const handleGeneratePayload = () => {
    if (!symbol.trim()) {
      setError("Token symbol is required.");
      return;
    }
    if (!isValidPublicKey(ownerPubKey)) {
      setError("Invalid owner public key. Must be 0x followed by 66 hex characters.");
      return;
    }
    if (!isValidHexSignature(ownerSignature)) {
      setError("Invalid owner signature. Must be a 0x-prefixed hex string.");
      return;
    }
    if (!isValidHexSignature(approvalSignature)) {
      setError("Invalid approval signature. Must be a 0x-prefixed hex string.");
      return;
    }
    if (!isValidAmount(amount)) {
      setError("Amount must be a positive number.");
      return;
    }

    const parsedProof = isValidMerkleProof(merkleProof);
    if (!parsedProof) {
      setError("Invalid merkle proof: must be a JSON array of 0x-prefixed hex strings.");
      return;
    }

    // Convert human-readable amount to base units (×10^8 for BEP2/BEP8).
    const _amount = new BigNumber(amount)
      .multipliedBy(BEACON_CHAIN_DECIMAL)
      .toFixed();

    setError("");
    const payload: RecoverPayload = {
      tokenSymbol: strTo32Bytes(symbol),
      amount: ethers.toBeHex(BigInt(_amount)),
      ownerSignature,
      ownerPubKey,
      approvalSignature,
      merkleProof: parsedProof,
    };
    setGeneratedPayload(payload);
  };

  return (
    <SectionWrapper title="4. Build Recover Payload (BNB Chain)">
      <div className="space-y-4">
        <Input
          label="Symbol (same as Step 2)"
          value={symbol}
          onChange={(v) => { setSymbol(v); setError(""); }}
          placeholder="Enter the same token symbol used in Step 2"
        />
        <Input
          label="Amount (same as Step 2)"
          value={amount}
          onChange={(v) => { setAmount(v); setError(""); }}
          placeholder="Enter the same amount used in Step 2"
        />
        <Input
          label="Owner Signature (bbcSigned.signature)"
          value={ownerSignature}
          onChange={(v) => { setOwnerSignature(v); setError(""); }}
          placeholder="Enter owner signature (0x-prefixed hex)"
        />
        <Input
          label="Owner Public Key (bbcSigned.publicKey)"
          value={ownerPubKey}
          onChange={(v) => { setOwnerPubKey(v); setError(""); }}
          placeholder="Enter owner public key (0x + 66 hex chars)"
        />
        <Input
          label="Approval Signature (bbcApproval.approval_signature)"
          value={approvalSignature}
          onChange={(v) => { setApprovalSignature(v); setError(""); }}
          placeholder="Enter approval signature (0x-prefixed hex)"
        />
        <Input
          label="Merkle Proof (bbcApproval.proofs)"
          value={merkleProof}
          onChange={(v) => { setMerkleProof(v); setError(""); }}
          placeholder='Enter merkle proof as JSON array (["0x...", ...])'
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> Both the Owner Signature (from the wallet) and the Approval Signature
          (from the server) must be <code>0x</code>-prefixed. If either is missing the prefix, prepend
          <code> 0x</code> before submitting.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleGeneratePayload} variant="primary">
          Generate Payload
        </Button>
      </div>
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100">
        <strong>This step only generates the payload.</strong> No transaction is broadcast here.
        You must call the contract&apos;s <code>recover</code> function yourself with a BNB Chain
        wallet that holds BNB for gas — see the code example below.
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Generated Payload (params for the contract <Strong>recover</Strong> function):
        </label>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(generatedPayload, null, 2)}
        </pre>
      </div>
      <label>Call contract <Strong>recover</Strong> function</label>
      Contract: <a
        href="https://bscscan.com/address/0x0000000000000000000000000000000000003000"
        className="text-blue-500 hover:text-blue-700 underline"
        target="_blank"
      >
        https://bscscan.com/address/0x0000000000000000000000000000000000003000
      </a>
      <div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
          {`const SECURITY_RECOVER_GAS_LIMIT = 1000000;

const receipt = await contract.recover(
  recoverPayload.tokenSymbol,
  recoverPayload.amount,
  recoverPayload.ownerPubKey,
  recoverPayload.ownerSignature,
  recoverPayload.approvalSignature,
  recoverPayload.merkleProof,
  {
    gasLimit: SECURITY_RECOVER_GAS_LIMIT,
  },
);
// 'receipt' is the tx receipt — safe to log; never print the payload's signatures.
console.log(receipt);
`}
        </pre>
      </div>
    </SectionWrapper>
  );
};
