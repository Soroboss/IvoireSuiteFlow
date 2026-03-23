import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"]
      },
      colors: {
        isf: {
          bgDeep: "var(--isf-bg-deep)",
          bgCard: "var(--isf-bg-card)",
          bgElevated: "var(--isf-bg-elevated)",
          bgHover: "var(--isf-bg-hover)",
          border: "var(--isf-border)",
          borderLight: "var(--isf-border-light)",
          gold: "var(--isf-gold)",
          goldLight: "var(--isf-gold-light)",
          cream: "var(--isf-cream)",
          text: "var(--isf-text)",
          textSecondary: "var(--isf-text-secondary)",
          textMuted: "var(--isf-text-muted)",
          success: "var(--isf-success)",
          error: "var(--isf-error)",
          warning: "var(--isf-warning)",
          info: "var(--isf-info)",
          purple: "var(--isf-purple)"
        }
      },
      boxShadow: {
        isfGlow: "0 0 0 1px var(--isf-gold-glow), 0 0 24px 0 var(--isf-gold-glow)"
      },
      keyframes: {
        "isf-pulse": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.25)" },
          "50%": { boxShadow: "0 0 0 10px rgba(34, 197, 94, 0)" }
        }
      },
      animation: {
        "isf-pulse": "isf-pulse 2s infinite"
      }
    }
  },
  plugins: []
};

export default config;
