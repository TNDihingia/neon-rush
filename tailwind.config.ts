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
        background: "#05050f",
        foreground: "#f3f4f6",
        neon: {
          cyan: "#00f0ff",
          pink: "#ff007f",
          purple: "#bd00ff",
          lime: "#39ff14",
          amber: "#ffb703",
          blue: "#0070f3",
          red: "#ff2a5f",
        },
        cyber: {
          dark: "#050510",
          card: "rgba(13, 13, 29, 0.75)",
          border: "rgba(0, 240, 255, 0.2)",
          accent: "#1e1b4b",
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.6), 0 0 30px rgba(0, 240, 255, 0.3)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.6), 0 0 30px rgba(255, 0, 127, 0.3)',
        'neon-purple': '0 0 15px rgba(189, 0, 255, 0.6), 0 0 30px rgba(189, 0, 255, 0.3)',
        'neon-lime': '0 0 15px rgba(57, 255, 20, 0.6), 0 0 30px rgba(57, 255, 20, 0.3)',
        'neon-glow': '0 0 25px rgba(0, 240, 255, 0.4), inset 0 0 15px rgba(0, 240, 255, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.7))' },
          '50%': { opacity: '0.85', filter: 'drop-shadow(0 0 25px rgba(189,0,255,0.9))' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
