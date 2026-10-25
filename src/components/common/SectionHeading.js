"use client";

export default function SectionHeading({ title, subtitle, script = false, className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      <h1
        className={`gold-text leading-tight ${
          script ? "font-script text-5xl sm:text-6xl md:text-7xl" : "font-heading text-3xl font-semibold sm:text-4xl md:text-5xl"
        }`}
      >
        {title}
      </h1>
      {subtitle ? <p className="mt-3 font-body text-sm text-ink/80 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
