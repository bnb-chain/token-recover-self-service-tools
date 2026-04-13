import { BBCSignMessage } from "@/modules/recover/section/SecondBBCSignMessage";
import { TokenList } from "./section/FirstTokenList";
import { GetApproval } from "@/modules/recover/section/ThirdgetApproval";
import { RecoverAsset } from "@/modules/recover/section/FourthRecoverAsset";

export const Recover = () => {
  return (
    <>
      <div className="text-center">
        <h1 className="font-bold text-2xl">NOTICE!!!</h1>
        <div className="font-bold">
          Please strictly follow the steps on the page to perform recovery. Before proceeding,
          please read the example in the readme and check the example screenshots.
        </div>
      </div>
      <TokenList />
      <BBCSignMessage />
      <GetApproval />
      <RecoverAsset />
    </>
  );
};
