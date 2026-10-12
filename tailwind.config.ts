import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#000000",
        "canvas-subtle": "#0A0A0A",
        "surface-card": "#121212",
        "surface-elevated": "#181818",
        "surface-active": "#222222",
        "border-subtle": "rgba(255, 255, 255, 0.08)",
        "border-default": "rgba(255, 255, 255, 0.16)",
        "border-strong": "rgba(255, 255, 255, 0.35)",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A3A3A3",
        "text-muted": "#525252",
      },
      borderRadius: {
        squircle: "28px",
        "3xl": "32px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        dotmatrix: ["var(--font-doto)", "Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
