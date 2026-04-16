import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['var(--font-outfit)', 'Arial', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          green:    "#1D9E75",
          "green-dark": "#0F6E56",
          "green-deep": "#0a5040",
          amber:    "#EF9F27",
          "amber-dark": "#d97706",
          bg:       "#F8FAF9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
