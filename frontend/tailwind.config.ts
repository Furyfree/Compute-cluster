import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dtu: {
          corporateRed: "#990000",
          white: "#ffffff",
          black: "#000000",
          blue: "#2F3EEA",
          brightGreen: "#1FD082",
          navyBlue: "#030F4F",
          yellow: "#F6D04D",
          orange: "#FC7634",
          pink: "#F7BBB1",
          grey: "#DADADA",
          red: "#E83F48",
          green: "#008835",
          purple: "#79238E",
        },
      },
      fontFamily: {
        sans: ["Arial", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
