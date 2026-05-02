import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  type?: "button" | "submit" | "reset";
}

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs tracking-widest",
  md: "px-7 py-3.5 text-md tracking-widest",
  lg: "px-10 py-5 text-base tracking-eyebrow",
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-bg border border-ink",
  secondary: "bg-transparent text-ink border border-rule-strong",
  ghost: "bg-transparent text-ink border border-transparent",
  gold: "bg-gold text-bg border border-gold",
  danger: "bg-danger text-white border border-danger",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = "primary",
      size = "md",
      full,
      disabled,
      className = "",
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2.5",
          "font-sans font-medium uppercase rounded-2xs cursor-pointer",
          "transition-transform duration-100 active:translate-y-px",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          sizeClasses[size],
          variantClasses[variant],
          full && "w-full",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
