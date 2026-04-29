// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
import { useEffect } from "react";

export const ErrorModal = ({
  title = "Error",
  message,
  onClose,
}: {
  title?: string;
  message: string | null;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!message) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 dark:border-gray-700 px-5 py-3">
          <h3
            id="error-modal-title"
            className="text-lg font-semibold text-red-600 dark:text-red-400"
          >
            {title}
          </h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 break-words">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
