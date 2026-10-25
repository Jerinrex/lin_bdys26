"use client";

import Link from "next/link";

const BASE =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-7 py-3 font-body text-base font-medium " +
  "transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-95 disabled:pointer-events-none disabled:opacity-50";

const VARIANTS = {
  gold: "bg-gold-gradient text-bg shadow-glow hover:shadow-glow-lg",
  outline: "border border-gold text-gold-light hover:bg-gold/10 hover:shadow-glow",
};

export default function Button({ children, href, onClick, variant = "gold", className = "", type = "button", ...props }) {
  const classes = `${BASE} ${VARIANTS[variant] || VARIANTS.gold} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}
