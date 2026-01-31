/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern, light, bright color palette
        background: '#F0FDFA',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F0FDFA',
          tertiary: '#CCFBF1',
        },
        text: {
          primary: '#134E4A',
          secondary: '#475569',
          muted: '#64748B',
          inverse: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#0891B2',
          hover: '#0E7490',
          light: '#CFFAFE',
          dark: '#155E75',
        },
        secondary: {
          DEFAULT: '#22D3EE',
          hover: '#06B6D4',
          light: '#A5F3FC',
        },
        cta: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          light: '#FED7AA',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        border: {
          DEFAULT: '#99F6E4',
          input: '#CBD5E1',
          light: '#CCFBF1',
        },
      },
      fontFamily: {
        heading: ['Varela Round', 'sans-serif'],
        body: ['Nunito Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['clamp(2rem, 5vw, 2.75rem)', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['clamp(1.5rem, 4vw, 2rem)', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '1.4', fontWeight: '600' }],
        base: ['18px', { lineHeight: '1.6' }],
        small: ['16px', { lineHeight: '1.5' }],
        xs: ['14px', { lineHeight: '1.5' }],
      },
      spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.06)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
        xl: '0 16px 48px rgba(0, 0, 0, 0.1)',
        soft: '0 2px 8px rgba(8, 145, 178, 0.08)',
        card: '0 4px 16px rgba(8, 145, 178, 0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
