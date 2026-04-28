// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
export const Strong = ({ children, color = 'red' }: { children: React.ReactNode, color?: string }) => {
  return <strong className={`text-${color}-500 font-bold text-xl`}>{children}</strong>;
};