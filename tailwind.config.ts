import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        foreground: "#EDEDED",
        surface: "#131314",
        "surface-1": "#141416",
        "surface-2": "#1C1C1F",
        "surface-dim": "#131314",
        "surface-bright": "#3a393a",
        "surface-container-lowest": "#0e0e0f",
        "surface-container-low": "#1c1b1c",
        "surface-container": "#201f20",
        "surface-container-high": "#2a2a2b",
        "surface-container-highest": "#353436",
        "on-surface": "#EDEDED",
        "on-surface-variant": "#8A8A8F",
        "outline": "#938ea1",
        "outline-variant": "#484555",
        "surface-tint": "#cabeff",
        primary: {
          DEFAULT: "#7C5CFC",
          foreground: "#FFFFFF",
          hover: "#8B6FFD",
          dim: "#cabeff",
          container: "#947dff",
          "on-container": "#2b0088",
        },
        accent: {
          DEFAULT: "#7C5CFC",
          hover: "#8B6FFD",
          violet: "#cabeff",
        },
        secondary: {
          DEFAULT: "#42efb2",
          foreground: "#003826",
          container: "#00d298",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        border: "rgba(255, 255, 255, 0.08)",
        "border-hover": "rgba(255, 255, 255, 0.16)",
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
