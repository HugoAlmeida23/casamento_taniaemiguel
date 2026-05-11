/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        'playfair': ['Playfair Display', 'Georgia', 'serif'],
        'montserrat': ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        olive: {
          50: '#f8f7f2',
          100: '#efeee5',
          200: '#dddbc9',
          300: '#c5c2a5',
          400: '#a9a57e',
          500: '#8f8a5e',
          600: '#74704a',
          700: '#5c593c',
          800: '#4a4833',
          900: '#3d3b2c',
        },
        beige: {
          50: '#fdfcf9',
          100: '#faf7f0',
          200: '#f5f0e3',
          300: '#ede6d3',
          400: '#e0d5be',
          500: '#d4c5a5',
          600: '#bfad87',
          700: '#a89468',
          800: '#8c7a52',
          900: '#6e6040',
        },
        gold: {
          50: '#fdf9ef',
          100: '#faf0d5',
          200: '#f4dfa8',
          300: '#edc972',
          400: '#e6b040',
          500: '#d4983a',
          600: '#b87a2e',
          700: '#995c27',
          800: '#7d4a25',
          900: '#683d22',
        },
      },
      ringWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
