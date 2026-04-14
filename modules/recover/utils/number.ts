import { ethers } from 'ethers';

export const numTo32Bytes = (amount: string) => {
  const amountHex = ethers.toBeHex(BigInt(amount));
  const amount32Bytes = ethers.zeroPadValue(amountHex, 32);

  return amount32Bytes;
};

export const strTo32Bytes = (str: string) => {
  return ethers.encodeBytes32String(str);
};
