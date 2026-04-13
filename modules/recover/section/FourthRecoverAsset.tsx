import { SectionWrapper } from "@/modules/recover/components/SectionWrapper";
import { Input, Button } from "@/modules/recover/components";
import { strTo32Bytes } from "@/modules/recover/utils/number";
import { ethers } from "ethers";
import { useState } from "react";
import { BEACON_CHAIN_DECIMAL } from "@/modules/recover/constants";
import BigNumber from "bignumber.js";
import { Strong } from "@/modules/recover/components/Strong";
import { isValidPublicKey, isValidHexSignature, isValidAmount, isValidMerkleProof } from "@/modules/recover/utils/validation";

export const RecoverAsset = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [ownerSignature, setOwnerSignature] = useState<string>("");
  const [ownerPubKey, setOwnerPubKey] = useState<string>("");
  const [approvalSignature, setApprovalSignature] = useState<string>("");
  const [merkleProof, setMerkleProof] = useState<string>("[]");
  const [recoverPayload, setRecoverPayload] = useState<object | null>(null);
  const [error, setError] = useState<string>("");

  const handleRecover = () => {
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

    const _amount = new BigNumber(amount)
      .multipliedBy(BEACON_CHAIN_DECIMAL)
      .toFixed();

    setError("");
    const payload = {
      tokenSymbol: strTo32Bytes(symbol),
      amount: ethers.BigNumber.from(_amount).toHexString(),
      ownerSignature,
      ownerPubKey,
      approvalSignature,
      merkleProof: parsedProof,
    };
    setRecoverPayload(payload);
  };

  return (
    <SectionWrapper title="4. Recover Asset(bsc chain)">
      <div className="space-y-4">
        <Input
          label="Symbol"
          value={symbol}
          onChange={(v) => { setSymbol(v); setError(""); }}
          placeholder="Enter token symbol"
        />
        <Input
          label="Amount"
          value={amount}
          onChange={(v) => { setAmount(v); setError(""); }}
          placeholder="Enter amount"
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
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          onClick={handleRecover}
          variant="primary"
        >
          Recover Asset
        </Button>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recover Payload(Call contract <Strong>recover</Strong> function
          params):
        </label>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(recoverPayload, null, 2)}
        </pre>
      </div>
      <label>call contract <Strong>recover</Strong> function</label>
      Contract: <a
        href="https://bscscan.com/address/0x0000000000000000000000000000000000003000"
        className="text-blue-500 hover:text-blue-700 underline"
        target="_blank"
      >
        https://bscscan.com/address/0x0000000000000000000000000000000000003000
      </a>
      <div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
          {`const [receipt, err] = await contract
    .recover(
      recoverPayload.tokenSymbol,
      recoverPayload.amount,
      recoverPayload.ownerPubKey,
      recoverPayload.ownerSignature,
      recoverPayload.approvalSignature,
      recoverPayload.merkleProof,
      {
        gasLimit: SECURITY_RECOVER_GAS_LIMIT,
      },
    )
    .then(resolve, commonFault);
`}
        </pre>
      </div>
    </SectionWrapper>
  );
};
