/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        spice: {
          gold: '#f59e0b',
          turmeric: '#eab308',
          chili: '#dc2626',
          curry: '#d97706',
          mint: '#10b981',
          charcoal: '#0f172a',
        },
        cream: '#faf6ee',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -4px rgba(234, 88, 12, 0.08)',
        'float': '0 20px 40px -15px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
