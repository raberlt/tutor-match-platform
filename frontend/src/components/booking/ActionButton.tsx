import React from "react";

interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit" | "reset";
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  children,
  variant = "primary",
  className = "",
  type = "button",
}) => {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium shadow-lg hover:shadow-xl transition-all duration-200";

  const variantClasses = {
    primary: "text-white hover:opacity-90",
    secondary:
      "border border-sky-300 text-sky-600 rounded-md hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300",
  };

  const primaryStyle =
    variant === "primary" ? { backgroundColor: "#94cce6" } : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      style={primaryStyle}
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  );
};

export default ActionButton;
