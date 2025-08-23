/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be185d',
          800: '#9f1239',
          900: '#881337',
        },
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '4/5': '4 / 5',
        '3/4': '3 / 4',
      },
    },
  },
  plugins: [],
}
