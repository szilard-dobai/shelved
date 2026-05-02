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
  sm: "px-[14px] py-2 text-xs tracking-[0.18em]",
  md: "px-[26px] py-[14px] text-[13px] tracking-[0.22em]",
  lg: "px-[38px] py-5 text-[15px] tracking-[0.28em]",
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-bg border border-ink",
  secondary: "bg-transparent text-ink border border-rule-strong",
  ghost: "bg-transparent text-ink border border-transparent",
  gold: "bg-gold text-bg border border-gold",
  danger:
    "bg-[color:var(--color-danger)] text-white border border-[color:var(--color-danger)]",
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
          "font-sans font-medium uppercase rounded-[1px] cursor-pointer",
          "transition-transform duration-100 active:translate-y-px",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "inline-flex items-center justify-center gap-[10px]",
          sizeClasses[size],
          variantClasses[variant],
          full ? "w-full" : "",
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
