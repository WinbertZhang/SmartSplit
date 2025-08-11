import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        customBlue: "#0F172A",
      },
      animation: {
        'gradientMove': 'gradientMove 10s ease infinite',
        'fadeInUp': 'fadeInUp 0.8s ease-out',
        'fadeInRight': 'fadeInRight 0.8s ease-out 0.2s both',
        'textGlow': 'textGlow 3s ease-in-out infinite',
        'gradientText': 'gradientText 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        gradientMove: {
          '0%': { backgroundPosition: '50% 50%' },
          '50%': { backgroundPosition: '75% 50%' },
          '100%': { backgroundPosition: '50% 50%' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        textGlow: {
          '0%, 100%': { textShadow: '0 0 20px rgba(255, 255, 255, 0.1)' },
          '50%': { textShadow: '0 0 30px rgba(255, 255, 255, 0.2), 0 0 40px rgba(255, 255, 255, 0.1)' },
        },
        gradientText: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
