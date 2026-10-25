/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0A",
        "bg-soft": "#141210",
        gold: "#D4AF37",
        "gold-light": "#F5E6A8",
        "gold-deep": "#A67C00",
        rose: "#B03A5B",
        ink: "#F4EBD0",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        script: ["var(--font-script)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F5E6A8, #D4AF37, #A67C00)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(212,175,55,0.25)",
        "glow-lg": "0 0 48px rgba(212,175,55,0.35)",
      },
    },
  },
  plugins: [],
};
