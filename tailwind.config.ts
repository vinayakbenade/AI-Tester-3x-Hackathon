import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "var(--base-950)",
          900: "var(--base-900)",
          800: "var(--base-800)",
          700: "var(--base-700)",
          600: "var(--base-600)",
        },
        severity: {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#64748b",
        },
        accent: {
          DEFAULT: "var(--accent)",
        },
        primary: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-muted)",
          secondary: "var(--text-secondary)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "sans-serif"],
        mono: ["Cascadia Code", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
