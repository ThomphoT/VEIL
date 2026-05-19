import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        veil: {
          bg: "#050816",
          panel: "#0B1220",
          cyan: "#22D3EE",
          electric: "#2563EB",
          trust: "#1D4ED8",
          text: "#F8FAFC",
          muted: "#94A3B8",
          danger: "#EF4444",
          warning: "#F59E0B",
          success: "#10B981",
          border: "#1E293B"
        }
      },
      boxShadow: {
        cyan: "0 0 36px rgba(34, 211, 238, 0.25)",
        danger: "0 0 44px rgba(239, 68, 68, 0.35)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      keyframes: {
        edgePulse: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(34, 211, 238, 0)" },
          "50%": { boxShadow: "0 0 28px rgba(34, 211, 238, 0.28)" }
        },
        scrollFeed: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      },
      animation: {
        edgePulse: "edgePulse 2.2s ease-in-out infinite",
        scrollFeed: "scrollFeed 420ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
