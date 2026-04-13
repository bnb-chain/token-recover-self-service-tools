export type ErrorMsg = string;
export type ErrorResponse = [null, ErrorMsg];
export const resolve = <R>(r: R): [R, null] => [r, null];

export const commonFault = (e: unknown): ErrorResponse => {
  const message = e instanceof Error ? e.message : 'Unknown error';
  console.error('[recover]', message);
  return [null, message];
};
