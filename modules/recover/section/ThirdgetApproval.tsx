import { useState } from "react";
import { getApproval, GetApprovalResponse } from "../server/recover";
import { SectionWrapper } from '@/modules/recover/components/SectionWrapper';
import { Input, Button } from '@/modules/recover/components';
import { Strong } from '@/modules/recover/components/Strong';
import { isValidBSCAddress, isValidPublicKey, isValidHexSignature } from '@/modules/recover/utils/validation';

export const GetApproval = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [serverApproval, setServerApproval] =
    useState<GetApprovalResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleGetApproval = async () => {
    if (!symbol.trim()) {
      setError("Token symbol is required.");
      return;
    }
    if (!isValidPublicKey(publicKey)) {
      setError("Invalid public key. Must be 0x followed by 66 hex characters.");
      return;
    }
    if (!isValidHexSignature(signature)) {
      setError("Invalid signature. Must be a 0x-prefixed hex string.");
      return;
    }
    if (!isValidBSCAddress(toAddress)) {
      setError("Invalid BSC address. Must be 0x followed by 40 hex characters.");
      return;
    }
    setError("");
    const [approval, err] = await getApproval({
      token_symbol: symbol,
      owner_pub_key: publicKey,
      owner_signature: signature,
      claim_address: toAddress,
    });
    if (err) {
      setError(err || "Failed to get approval.");
    } else {
      setServerApproval(approval);
    }
  };

  return (
    <SectionWrapper title="3. Input signed result from wallet to get approval">
      <div className="space-y-4">
        <Input
          label="Symbol"
          value={symbol}
          onChange={(v) => { setSymbol(v); setError(""); }}
          placeholder="Enter token symbol"
        />
        <Input
          label="Public Key"
          value={publicKey}
          onChange={(v) => { setPublicKey(v); setError(""); }}
          placeholder="Enter public key (0x + 66 hex chars)"
        />
        <Input
          label="Signature"
          value={signature}
          onChange={(v) => { setSignature(v); setError(""); }}
          placeholder="Enter signature (0x-prefixed hex)"
        />
        <Input
          label="To BSC Address"
          value={toAddress}
          onChange={(v) => { setToAddress(v); setError(""); }}
          placeholder="Enter destination address (0x...)"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          onClick={handleGetApproval}
          variant="primary"
        >
          Get Approval
        </Button>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Server Approval(<Strong>bbcApproval</Strong>):</label>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(serverApproval, null, 2)}
        </pre>
      </div>
    </SectionWrapper>
  );
};
