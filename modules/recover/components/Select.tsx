// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
export interface SelectOption {
  value: string;
  label: string;
}

export const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Please select an option",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-3
          border border-gray-300 rounded-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-gray-400 dark:hover:border-gray-600
          transition-all duration-200 ease-in-out
          shadow-sm hover:shadow-md focus:shadow-lg
          cursor-pointer
        "
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
