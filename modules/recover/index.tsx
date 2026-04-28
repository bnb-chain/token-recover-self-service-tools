// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
import { BBCSignMessage } from "@/modules/recover/section/SecondBBCSignMessage";
import { TokenList } from "./section/FirstTokenList";
import { GetApproval } from "@/modules/recover/section/ThirdgetApproval";
import { RecoverAsset } from "@/modules/recover/section/FourthRecoverAsset";

export const Recover = () => {
  return (
    <>
      <div className="m-6 flex gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
        <span
          aria-hidden
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
        >
          !
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-amber-900 dark:text-amber-100">Notice</p>
          <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
            Please strictly follow the steps below to perform recovery. Before proceeding,
            please read the step-by-step example and reference screenshot in the{" "}
            <a
              href="https://github.com/bnb-chain/token-recover-self-service-tools#step-by-step-recovery-example-bnb-chain-mainnet"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-200"
            >
              README
            </a>
            .
          </p>
          <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
            <strong>Two wallets:</strong> Step 2 signs offline with your Beacon Chain wallet (no gas).
            Step 4 only generates a payload — broadcasting the <code>recover</code> tx requires the
            BNB Chain key for <em>To BSC Address</em>, which must hold BNB for gas.
          </p>
        </div>
      </div>
      <TokenList />
      <BBCSignMessage />
      <GetApproval />
      <RecoverAsset />
    </>
  );
};
