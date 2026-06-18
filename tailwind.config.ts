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
        charcoal: "#0A0F18",
        surface: "#111826",
        gold: "#C9A84C",
        "gold-deep": "#A07A2A",
        "gold-light": "#E8D9A0",
        navy: "#1A2742",
        "navy-deep": "#0F1B30",
        muted: "#26365C",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
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
