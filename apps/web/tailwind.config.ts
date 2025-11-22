import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
          50: '#FCE9EA',
          100: '#F9D3D6',
          200: '#F3A7AD',
          300: '#ED7B85',
          400: '#E74F5C',
          500: '#E63946',
          600: '#C41D2A',
          700: '#93161F',
          800: '#620F15',
          900: '#31070A',
        },
        secondary: {
          DEFAULT: '#1D3557',
          50: '#E8ECF1',
          100: '#D1D9E3',
          200: '#A3B3C7',
          300: '#758DAB',
          400: '#47678F',
          500: '#1D3557',
          600: '#172A46',
          700: '#112034',
          800: '#0B1523',
          900: '#060B11',
        },
        accent: {
          DEFAULT: '#F4A261',
          50: '#FEF5EC',
          100: '#FDEBD9',
          200: '#FBD7B3',
          300: '#F9C38D',
          400: '#F7AF67',
          500: '#F4A261',
          600: '#F08324',
          700: '#C46610',
          800: '#8E4A0C',
          900: '#582E07',
        },
        success: '#2A9D8F',
        warning: '#E9C46A',
        error: '#E63946',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
