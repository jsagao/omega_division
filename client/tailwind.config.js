/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050a18",
          900: "#0a0f1e",
          800: "#0f1629",
          700: "#151d35",
          600: "#1a2541",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#d4b85a",
          dark: "#b8953d",
          muted: "#a08a3e",
          50: "#fdf8eb",
        },
        surface: {
          DEFAULT: "#111827",
          raised: "#1a2236",
          elevated: "#1f2a3e",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        display: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "#1e293b",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
