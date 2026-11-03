import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-tema="noche"]'],
  theme: {
    extend: {
      colors: {
        profe: {
          dark: "#0b1026",
          darkNavy: "#151c3d",
          navy: "#1b2559",
          border: "#2a3568",
          lightBorder: "#d3d9ef",
          text: "#eef1ff",
          mute: "#9aa4d6",
          gold: "#ffd166",
          coral: "#ff6b8b",
          mint: "#5eead4",
          violet: "#a78bfa",
          blue: "#5ab0ff",
        },
      },
      fontFamily: {
        fredoka: ["Fredoka", "Nunito", "sans-serif"],
        nunito: ["Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
