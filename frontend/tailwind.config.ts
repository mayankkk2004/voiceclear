import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        paper: "#fefdf9",
        coral: "#ff6b5b",
        sage: "#4a7c59",
        sky: "#5b9acf"
      },
      boxShadow: {
        glow: "0 14px 40px rgba(14, 165, 163, 0.18)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseDot: {
          "0%,100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.25)", opacity: "1" }
        }
      },
      animation: {
        rise: "rise 380ms ease-out",
        pulseDot: "pulseDot 1s infinite"
      }
    }
  },
  plugins: []
};

export default config;
