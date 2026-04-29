// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
export const SectionWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-4 border-2 border-gray-300 dark:border-gray-700 p-4 rounded-md m-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {children}
    </div>
  );
};