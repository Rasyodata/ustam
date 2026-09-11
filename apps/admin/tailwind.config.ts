import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { DEFAULT: "#ff7a1a", light: "#ffb347" } } } },
  plugins: [],
} satisfies Config;
