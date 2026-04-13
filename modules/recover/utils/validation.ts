/** BBC (Beacon Chain) bech32 address: starts with bnb1, 39 chars total */
export const isValidBBCAddress = (address: string): boolean =>
  /^bnb1[a-z0-9]{38}$/.test(address);

/** BSC/EVM address: 0x followed by exactly 40 hex chars */
export const isValidBSCAddress = (address: string): boolean =>
  /^0x[0-9a-fA-F]{40}$/.test(address);

/** Compressed secp256k1 public key: 0x + 66 hex chars (33 bytes) */
export const isValidPublicKey = (key: string): boolean =>
  /^0x[0-9a-fA-F]{66}$/.test(key);

/** Hex-encoded signature: 0x followed by even number of hex chars */
export const isValidHexSignature = (sig: string): boolean =>
  /^0x[0-9a-fA-F]+$/.test(sig) && sig.length % 2 === 0;

/** Positive numeric amount (not zero, not negative, not empty) */
export const isValidAmount = (amount: string): boolean =>
  /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;

/** Merkle proof: JSON array where every element is a 0x-prefixed hex string */
export const isValidMerkleProof = (raw: string): string[] | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every((item) => typeof item === 'string' && /^0x[0-9a-fA-F]+$/.test(item))) return null;
    return parsed as string[];
  } catch {
    return null;
  }
};
