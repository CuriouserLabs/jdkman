/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8f7f2",
          100: "#ccefe4",
          200: "#9ae0cf",
          400: "#30b496",
          500: "#0d7a68",
          600: "#095e50",
          700: "#07483d",
          800: "#05352d",
          900: "#03241e",
        },
        accent: {
          50: "#fff1e8",
          100: "#ffe0cb",
          200: "#ffc095",
          400: "#f28f53",
          500: "#e87830",
          600: "#c9621d",
          700: "#a54f13",
          800: "#813d10",
          900: "#5d2b0b",
        },
      },
      fontFamily: {
        sans: [
          "Space Grotesk",
          "Aptos",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "JetBrains Mono", "Cascadia Code", "monospace"],
      },
    },
  },
  plugins: [],
};
