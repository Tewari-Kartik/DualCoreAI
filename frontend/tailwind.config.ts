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
        canvas: "#080B11",
        surface: "#0D1117",
        "surface-hover": "#0F1318",
        border: {
          DEFAULT: "#1C2230",
          hover: "#2C3545",
          faint: "#161C28",
        },
        ink: {
          DEFAULT: "#EEF1F6",
          muted: "#C8D0DC",
          soft: "#8995A6",
          dim: "#6B7A8D",
          faint: "#4A5568",
          ghost: "#2E3847",
        },
        accent: {
          teal: "#3FC9B5",
          violet: "#9D7CFF",
          amber: "#E8A33D",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        msgIn: {
          from: { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out both",
        msgIn: "msgIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
