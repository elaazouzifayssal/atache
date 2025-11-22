/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
          50: '#FCE9EA',
          500: '#E63946',
          600: '#C41D2A',
        },
        secondary: {
          DEFAULT: '#1D3557',
          500: '#1D3557',
        },
        accent: {
          DEFAULT: '#F4A261',
          500: '#F4A261',
        },
        success: '#2A9D8F',
        warning: '#E9C46A',
        error: '#E63946',
      },
    },
  },
  plugins: [],
};
