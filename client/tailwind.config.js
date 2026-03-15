/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#1d1d1f',
        muted: '#6e6e73',
        faint: '#f5f5f7',
        coral: '#ff5f45',
        surface: '#ffffff',
        border: '#e8e8ed',
      },
      fontSize: {
        'display': ['clamp(2.8rem, 6vw, 5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'hero': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      animation: {
        'float': 'float 7s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 1s infinite',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'phone': '0 32px 80px -8px rgba(0,0,0,0.18), 0 8px 24px -4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
        'phone-hover': '0 48px 100px -12px rgba(0,0,0,0.24), 0 12px 32px -6px rgba(0,0,0,0.12)',
        'card': '0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'nav': '0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'btn': '0 2px 8px rgba(255,95,69,0.3), 0 1px 2px rgba(255,95,69,0.2)',
        'btn-hover': '0 6px 20px rgba(255,95,69,0.4), 0 2px 6px rgba(255,95,69,0.25)',
      },
    },
  },
  plugins: [],
}
