"use client";

import React from "react";
import { cn } from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    const variants = {
      primary: "bg-[#c87740] text-white hover:bg-[#d9854d] shadow-sm font-bold border border-[#c87740]/40 shadow-[#c87740]/20",
      secondary: "bg-[#1d2218] text-[#fdf6e3] hover:bg-[#252a1e] border border-[#2d3525]",
      outline: "border border-[#2d3525] bg-transparent hover:bg-[#1d2218] text-[#fdf6e3]",
      ghost: "hover:bg-[#1d2218] text-[#d8c3a5] hover:text-[#fdf6e3]",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg",
      md: "h-10 px-4 text-sm font-medium rounded-xl",
      lg: "h-12 px-6 text-base font-semibold rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c87740] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
