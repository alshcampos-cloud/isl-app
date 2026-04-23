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
        navy: {
          50:  '#EFF3F8',
          100: '#D8E2F0',
          200: '#B1C5E0',
          300: '#8AA8D1',
          400: '#6E93C5',
          500: '#4A7AB5',
          600: '#2D5F9A',
          700: '#1E3A5F',
          800: '#162C48',
          900: '#0E1D30',
          950: '#070F18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
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
        'card': '0.75rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.1), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
