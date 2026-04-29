// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
export type ErrorMsg = string;
export type ErrorResponse = [null, ErrorMsg];
export const resolve = <R>(r: R): [R, null] => [r, null];

const BBC_ADDRESS_PATTERN = /bnb1[a-z0-9]{38}/g;

const redactSensitive = (s: string): string => s.replace(BBC_ADDRESS_PATTERN, 'bnb1<redacted>');

export const commonFault = (e: unknown): ErrorResponse => {
  const message = e instanceof Error ? e.message : 'Unknown error';
  if (process.env.NODE_ENV !== 'production') {
    console.error('[recover]', redactSensitive(message));
  }
  return [null, message];
};
