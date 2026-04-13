import { ethers } from 'ethers';

export const numTo32Bytes = (amount: string) => {
  const amountBigNumber = ethers.BigNumber.from(amount);
  const amount32Bytes = ethers.utils.hexZeroPad(amountBigNumber.toHexString(), 32);

  return amount32Bytes;
};

export const strTo32Bytes = (str: string) => {
  return ethers.utils.formatBytes32String(str);
};
