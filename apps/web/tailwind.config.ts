import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#ff7a1a", 600: "#ea6a0e", light: "#ffb347" },
        ink: { DEFAULT: "#0f1420", soft: "#151c2c", card: "#1b2335" },
      },
      borderRadius: { xl: "1rem" },
    },
  },
  plugins: [],
} satisfies Config;
