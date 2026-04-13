export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  const baseClasses = `
    font-medium rounded-lg transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    shadow-sm hover:shadow-md active:shadow-lg
  `;

  const variantClasses = {
    primary: `
      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
      text-white border border-blue-600
      focus:ring-blue-500
    `,
    secondary: `
      bg-gray-600 hover:bg-gray-700 active:bg-gray-800
      text-white border border-gray-600
      focus:ring-gray-500
    `,
    outline: `
      bg-transparent hover:bg-gray-50 active:bg-gray-100
      text-gray-700 border border-gray-300 hover:border-gray-400
      dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800
      focus:ring-gray-500
    `,
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {children}
    </button>
  );
};
