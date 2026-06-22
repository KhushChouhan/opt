import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        charcoal: "#050c14",
        surface: "#0b131e",
        gold: "#c7a14e",
        "gold-deep": "#9e782f",
        "gold-light": "#e8d9a0",
        navy: "#0d1522",
        "navy-deep": "#0b131e",
        muted: "#1c2536",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        luxury: ["var(--font-display)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "DM Sans", "sans-serif"],
      },
      keyframes: {
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "bounce-gentle": "bounce-gentle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
