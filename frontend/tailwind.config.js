/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2f9',
          100: '#d5e0f1',
          200: '#acc1e3',
          300: '#7899cc',
          400: '#4d73b5',
          500: '#2d549a',
          600: '#1e3a6e',
          700: '#172d55',
          800: '#11203d',
          900: '#0b1628',
        },
        accent: {
          400: '#4ea8c4',
          500: '#3490a8',
          600: '#236e82',
        },
        neutral: {
          50:  '#f7f8fa',
          100: '#eef0f4',
          200: '#dde1e9',
          300: '#c4cad6',
          400: '#9aa3b2',
          500: '#6b7585',
          600: '#4e5769',
          700: '#363f4f',
          800: '#232b38',
          900: '#141920',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
      },
    },
  },
  plugins: [],
};
