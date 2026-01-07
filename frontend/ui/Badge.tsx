import React from "react";

// COMPONENT (Can be Server Component - no hooks/interactivity)
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
}) => {
  const variantStyles = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};
