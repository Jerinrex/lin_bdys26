"use client";

export default function GoldCard({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag className={`gold-card ${className}`} {...props}>
      {children}
    </Tag>
  );
}
