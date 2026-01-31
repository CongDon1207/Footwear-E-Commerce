/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F0F9FF',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
        },
        text: {
          primary: '#0C4A6E',
          secondary: '#475569',
          muted: '#64748B',
        },
        primary: {
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
          light: '#E0F2FE',
        },
        cta: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
        },
        success: '#059669',
        error: '#DC2626',
        warning: '#F59E0B',
        border: {
          DEFAULT: '#BAE6FD',
          input: '#CBD5E1',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: 'clamp(2rem, 5vw, 2.5rem)',
        h2: 'clamp(1.5rem, 4vw, 1.875rem)',
        base: '18px',
        small: '16px',
      },
      spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.08)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
}
