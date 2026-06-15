/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        battery: {
          bg: '#1a1a2e',
          surface: '#16213e',
          card: '#1e2a45',
          border: '#2a3a5c',
          accent: '#ff6b35',
          accentHover: '#ff8555',
          danger: '#e74c3c',
          warning: '#f39c12',
          success: '#27ae60',
          blue: '#0f3460',
          text: '#e8e8e8',
          muted: '#8892a8',
        }
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Noto Sans SC', 'DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255,107,53,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255,107,53,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
