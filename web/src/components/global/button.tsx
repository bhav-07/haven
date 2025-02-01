import React, { ReactNode } from "react";

type ButtonVariant = "light" | "dark";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "light",
  size = "md",
  className = "",
  ...rest
}) => {
  const variantStyles = {
    light: {
      gradient: "bg-gradient-to-br from-[#fdfcfb] to-[#fff1e6]",
      text: "text-neutral-800",
    },
    dark: {
      gradient: "bg-gradient-to-br from-[#414345] to-[#232526]",
      text: "text-white",
    },
  };

  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`
        ${variantStyles[variant].gradient}
        ${variantStyles[variant].text}
        ${sizeStyles[size]}
        rounded-lg 
        transition-all 
        duration-300 
        hover:opacity-90 
        active:scale-95 
        focus:outline-none 
        focus:ring-2 
        focus:ring-opacity-50
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
