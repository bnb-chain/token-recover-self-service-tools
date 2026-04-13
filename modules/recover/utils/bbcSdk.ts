import { numTo32Bytes, strTo32Bytes } from './number';
import { convertObjectToSignBytes } from './encoder';

export const getSignBytes = async ({
  to,
  amount,
  symbol,
  chainId,
}: {
  to: string;
  amount: string;
  symbol: string;
  chainId: string;
}) => {
  const signMsg = {
    account_number: '0',
    chain_id: chainId,
    data: null,
    memo: '',
    msgs: [
      {
        amount: numTo32Bytes(amount).slice(2),
        recipient: to.toLowerCase(),
        token_symbol: strTo32Bytes(symbol).slice(2),
      },
    ],
    sequence: '0',
    source: '0',
  };

  return convertObjectToSignBytes(signMsg);
};
