/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#B69538',
        textPrimary: '#010101',
        textDisabled: '#515151',
        whitef1: '#f1f1f1',
      },
      fontFamily: {
        circular: ['Circular Std', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      fontSize: {
        heading1: '52px',
        heading2: '44px',
        heading3: '38px',
        heading4: '32px',
        heading5: '24px',
        heading6: '20px',
        bodyText1: '18px',
        bodyText2: '14px'
      }
    },
  },
  plugins: [],
}
