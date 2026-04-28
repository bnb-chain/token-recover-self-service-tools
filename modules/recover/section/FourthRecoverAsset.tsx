// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
import { SectionWrapper } from "@/modules/recover/components/SectionWrapper";
import { Input, Button } from "@/modules/recover/components";
import { strTo32Bytes } from "@/modules/recover/utils/number";
import { ethers } from "ethers";
import { useState } from "react";
import { BEACON_CHAIN_DECIMAL, IS_TESTNET } from "@/modules/recover/constants";
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

type SimulateResult = { ok: true; message: string } | { ok: false; message: string };

const RECOVER_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000003000";

// Full ABI including custom errors so ethers can decode revert reasons.
// Source: bnb-chain/bsc-genesis-contract/contracts/TokenRecoverPortal.sol
const RECOVER_ABI = [
  "function recover(bytes32 tokenSymbol, uint256 amount, bytes ownerPubKey, bytes ownerSignature, bytes approvalSignature, bytes32[] merkleProof) external",
  "error AlreadyRecovered()",
  "error InvalidProof()",
  "error InvalidApprovalSignature()",
  "error InvalidOwnerPubKeyLength()",
  "error InvalidOwnerSignatureLength()",
  "error MerkleRootNotInitialized()",
  "error TokenRecoverPortalPaused()",
  "error ApprovalAddressNotInitialized()",
];

// Human-friendly hint per contract error.
const ERROR_HINTS: Record<string, string> = {
  AlreadyRecovered:
    "This token has already been recovered. Either you submitted it before, or another claim landed first.",
  InvalidProof:
    "The merkle proof is not valid against the current on-chain merkle root. Re-fetch the approval in Step 3.",
  InvalidApprovalSignature:
    "The server's approval signature did not verify. Re-fetch the approval in Step 3.",
  InvalidOwnerPubKeyLength:
    "Owner public key must be exactly 33 bytes (a 0x-prefixed hex string of length 68).",
  InvalidOwnerSignatureLength:
    "Owner signature must be exactly 64 bytes (a 0x-prefixed hex string of length 130).",
  MerkleRootNotInitialized: "The contract's merkle root is not initialized yet.",
  TokenRecoverPortalPaused: "The token recover portal is paused on-chain.",
  ApprovalAddressNotInitialized: "The contract's approval address is not initialized yet.",
};

// Public BSC RPCs already covered by the CSP connect-src whitelist (*.bnbchain.org).
const SIMULATE_RPC_URL = IS_TESTNET
  ? "https://bsc-testnet-dataseed.bnbchain.org"
  : "https://bsc-dataseed.bnbchain.org";

export const RecoverAsset = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [ownerSignature, setOwnerSignature] = useState<string>("");
  const [ownerPubKey, setOwnerPubKey] = useState<string>("");
  const [approvalSignature, setApprovalSignature] = useState<string>("");
  const [merkleProof, setMerkleProof] = useState<string>("[]");
  const [generatedPayload, setGeneratedPayload] = useState<RecoverPayload | null>(null);
  const [error, setError] = useState<string>("");
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulateResult, setSimulateResult] = useState<SimulateResult | null>(null);

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

    const _amount = new BigNumber(amount)
      .multipliedBy(BEACON_CHAIN_DECIMAL)
      .toFixed();

    setError("");
    setSimulateResult(null);
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

  const handleSimulate = async () => {
    if (!generatedPayload) return;
    setSimulating(true);
    setSimulateResult(null);
    try {
      const provider = new ethers.JsonRpcProvider(SIMULATE_RPC_URL);
      const contract = new ethers.Contract(RECOVER_CONTRACT_ADDRESS, RECOVER_ABI, provider);
      await contract.recover.staticCall(
        generatedPayload.tokenSymbol,
        generatedPayload.amount,
        generatedPayload.ownerPubKey,
        generatedPayload.ownerSignature,
        generatedPayload.approvalSignature,
        generatedPayload.merkleProof,
      );
      setSimulateResult({
        ok: true,
        message: "Static call succeeded — the contract would accept this payload at the current head.",
      });
    } catch (err: unknown) {
      const e = err as {
        revert?: { name?: string };
        reason?: string;
        shortMessage?: string;
        message?: string;
      };
      const errorName = e?.revert?.name;
      if (errorName && ERROR_HINTS[errorName]) {
        setSimulateResult({ ok: false, message: `${errorName}: ${ERROR_HINTS[errorName]}` });
      } else if (errorName) {
        setSimulateResult({ ok: false, message: errorName });
      } else {
        const reason = e?.reason || e?.shortMessage || e?.message || "Unknown error";
        setSimulateResult({ ok: false, message: reason });
      }
    } finally {
      setSimulating(false);
    }
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
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGeneratePayload} variant="primary">
            Generate Payload
          </Button>
          <Button
            onClick={handleSimulate}
            variant="secondary"
            disabled={!generatedPayload || simulating}
          >
            {simulating ? "Simulating…" : "Simulate Call"}
          </Button>
        </div>
        {simulateResult && (
          <p
            className={
              "text-sm " +
              (simulateResult.ok
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400")
            }
          >
            <strong>{simulateResult.ok ? "✓ Simulation OK:" : "✗ Simulation reverted:"}</strong>{" "}
            {simulateResult.message}
          </p>
        )}
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
