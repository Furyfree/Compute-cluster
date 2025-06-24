import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "dtu-corporate-red": "#990000",
        "dtu-red": "#cc0000",
        "dtu-navy-blue": "#030F4F",
        "dtu-blue": "#2F5F8F",
        "dtu-grey": "#747474",
        "dtu-white": "#FFFFFF",
        "dtu-black": "#000000",
        "dtu-green": "#009639",
        "dtu-green-300": "#4CAF50",
        "dtu-orange": "#FF6600",
        "dtu-orange-300": "#FF8533",
        "dtu-yellow": "#FFCC00",
      },
    },
  },
  plugins: [],
};

export default config;
