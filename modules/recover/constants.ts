// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
export const BEACON_CHAIN_DECIMAL = 10 ** 8;
export const SECURITY_RECOVER_GAS_LIMIT = 1000000;

export const APPROVAL_API =
  process.env.NEXT_PUBLIC_APPROVAL_API || 'https://mainnet-token-recover-api.bnbchain.org';

export const IS_TESTNET = APPROVAL_API.includes('testnet');

export const BSC_EXPLORER_URL = IS_TESTNET
  ? 'https://testnet.bscscan.com'
  : 'https://bscscan.com';