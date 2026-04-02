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
        gold: "#c9a96e",
        "deep-indigo": "#1a1a3e",
        amber: "#d4a053",
        "trance-dark": "#0a0a0f",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "breathe-in": "breatheIn 4s ease-in-out",
        "breathe-out": "breatheOut 6s ease-in-out",
        "fade-in": "fadeIn 2s ease-in-out",
        "slow-spin": "slowSpin 30s linear infinite",
      },
      keyframes: {
        breatheIn: {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(1.2)", opacity: "1" },
        },
        breatheOut: {
          "0%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(0.8)", opacity: "0.6" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slowSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
