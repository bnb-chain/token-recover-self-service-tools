import { useState } from "react";
import { ERecoverStatus, getRecoverList, RecoverToken } from "../server/recover";
import { SectionWrapper } from '@/modules/recover/components/SectionWrapper';
import { Input, Button } from '@/modules/recover/components';
import { isValidBBCAddress } from '@/modules/recover/utils/validation';
import { secondsToTimeString } from '@/modules/recover/utils/time';
import { BSC_EXPLORER_URL } from '@/modules/recover/constants';

const UNBOUND_TOKEN_TIP =
  'This is an unbound token; it cannot be recovered to BNB Chain via this tool. ' +
  'Please contact the project owner about how to migrate this asset.';

const StatusCell = ({ token }: { token: RecoverToken }) => {
  switch (token.status) {
    case ERecoverStatus.Pending:
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 text-xs font-medium">
          Ready to Recover
        </span>
      );

    case ERecoverStatus.Requested:
    case ERecoverStatus.Locked:
    case ERecoverStatus.Withdrawing: {
      const remaining = token.unlock_at - Math.floor(Date.now() / 1000);
      return (
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {remaining > 0 ? `${secondsToTimeString(remaining)} remaining` : "Unlocking…"}
        </span>
      );
    }

    case ERecoverStatus.NotBounded:
      return (
        <span
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium cursor-help"
          title={UNBOUND_TOKEN_TIP}
        >
          Unable to Recover
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 text-[10px] text-gray-700 dark:text-gray-200"
          >
            ?
          </span>
        </span>
      );

    case ERecoverStatus.Unlocked: {
      const url =
        token.symbol === "BNB"
          ? `${BSC_EXPLORER_URL}/address/${token.recipient_address}`
          : `${BSC_EXPLORER_URL}/token/${token.contract_address}?a=${token.recipient_address}`;
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Check on BSC
          <span aria-hidden>↗</span>
        </a>
      );
    }

    case ERecoverStatus.Cancelled:
      return (
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Cancelled
        </span>
      );

    default:
      return <span className="text-gray-400 text-sm">—</span>;
  }
};

export const TokenList = () => {
  const [list, setList] = useState<RecoverToken[]>([]);
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [queried, setQueried] = useState<boolean>(false);

  const handleGetList = async () => {
    if (!isValidBBCAddress(address)) {
      setError("Invalid Beacon Chain address. Must start with 'bnb1' and be 39 characters long.");
      return;
    }
    setError("");
    setQueried(false);
    const res = await getRecoverList(address);
    setList(res.data ?? []);
    setQueried(true);
  };

  return (
    <SectionWrapper title="1. Input Your Beacon Chain Address to Get Recoverable Tokens">
      <div className="space-y-4">
        <Input
          label="Beacon Chain Address"
          value={address}
          onChange={(v) => { setAddress(v); setError(""); }}
          placeholder="Enter your beacon chain address (bnb1...)"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          onClick={handleGetList}
          variant="primary"
        >
          Get List
        </Button>
      </div>
      {queried && list.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-400 text-sm">
            No recoverable tokens found for this address.
          </p>
        </div>
      )}
      {list.length > 0 && (
        <div className="mt-4">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Symbol
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.symbol} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {item.symbol}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-green-600 dark:text-green-400">
                    {item.amount}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                    <StatusCell token={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionWrapper>
  );
};
