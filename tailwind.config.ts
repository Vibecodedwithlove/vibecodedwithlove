import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Warm color palette
        warmPrimary: {
          50: "#fdf8f3",
          100: "#fae8d6",
          200: "#f5d5b8",
          300: "#f0c69d",
          400: "#ecb880",
          500: "#e8a855",
          600: "#d89532",
          700: "#c07f24",
          800: "#a86d1d",
          900: "#8f5d18",
        },
        warmSecondary: {
          50: "#fffbf0",
          100: "#ffe8cc",
          200: "#ffd9a8",
          300: "#ffcb85",
          400: "#ffba61",
          500: "#ffa83d",
          600: "#ff9500",
          700: "#d97706",
          800: "#b45309",
          900: "#92400e",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
