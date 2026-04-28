// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
import axios from 'axios';

import { ErrorResponse, commonFault } from './common';
import { APPROVAL_API } from '../constants';

export enum ERecoverStatus {
  NotBounded = 1,
  Pending = 2,
  Requested = 3,
  Locked = 4,
  Withdrawing = 5,
  Unlocked = 6,
  Cancelled = 7,
}


export type GetApprovalParams = {
  token_symbol: string;
  owner_pub_key: string;
  owner_signature: string;
  claim_address: string;
};

export type GetApprovalResponse = {
  amount: number;
  proofs: string[];
  approval_signature: string;
};

export const getApproval = async (
  params: GetApprovalParams,
): Promise<ErrorResponse | [GetApprovalResponse, null]> => {
  try {
    const response = await axios.post(`${APPROVAL_API}/approve`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const body = response.data;
    // Backend returns 200 with { code: number, error?: string, data?: T }.
    // code 0 = success; anything else is an application-level error and
    // would otherwise be silently swallowed (data.data === undefined).
    if (body && typeof body.code === 'number' && body.code !== 0) {
      return [null, body.error || body.message || `Request failed (code ${body.code})`];
    }
    if (!body?.data) {
      return [null, 'Empty response from approval server.'];
    }
    return [body.data, null];
  } catch (error) {
    return commonFault(error);
  }
};

export type RecoverToken = {
  name: string;
  symbol: string;
  amount: string;
  status: number;
  contract_address: string;
  recipient_address: string;
  unlock_at: number;
};

export type GetRecoverListResponse = {
  count: number;
  data: RecoverToken[];
};

export const getRecoverList = async (address: string): Promise<GetRecoverListResponse> => {
  const response = await axios.get(
    `${APPROVAL_API}/api/recover/list/${address}?limit=1000&offset=0`,
  );

  return response.data;
};

export const getRecoverToken = async (address: string, symbol: string): Promise<RecoverToken> => {
  const response = await axios.get(`${APPROVAL_API}/api/recover/token/${address}?symbol=${symbol}`);

  return response.data;
};

const MAX_POLL_RETRIES = 30; // 30 × 2s = 60s max

export const checkTokenStatus = async (
  address: string,
  symbol: string,
  retries = 0,
): Promise<void> => {
  if (retries >= MAX_POLL_RETRIES) {
    return;
  }
  try {
    const response = await axios.get(
      `${APPROVAL_API}/api/recover/token/${address}?symbol=${symbol}`,
    );

    if (response.status !== 200) {
      return;
    }

    const data = response.data;

    if (data.code !== undefined) {
      return;
    }

    const status = data.data.status;

    if (status !== ERecoverStatus.Pending) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await checkTokenStatus(address, symbol, retries + 1);
  } catch {
    return;
  }
};
