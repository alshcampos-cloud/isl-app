/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Warm neutral scale — replaces sterile grays with warmer tones
      // Use warm-* alongside existing gray-* (non-breaking addition)
      colors: {
        warm: {
          50:  '#fafaf8',
          100: '#f5f5f0',
          200: '#e8e8e0',
          300: '#d4d4c8',
          400: '#a8a89c',
          500: '#787870',
          600: '#5c5c54',
          700: '#44443e',
          800: '#2e2e28',
          900: '#1f1e1c',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4 Variable"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'skeleton-wave': 'skeletonWave 1.8s ease-in-out infinite',
      },
      keyframes: {
        skeletonWave: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
