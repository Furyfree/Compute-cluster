/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DTU Primary Colors
        'dtu-red': '#990000',
        'dtu-white': '#ffffff',
        'dtu-black': '#000000',

        // DTU Secondary Colors
        'dtu-blue': '#2F3EEA',
        'dtu-bright-green': '#1FD082',
        'dtu-navy': '#030F4F',
        'dtu-yellow': '#F6D04D',
        'dtu-orange': '#FC7634',
        'dtu-pink': '#F7BBB1',
        'dtu-grey': '#DADADA',
        'dtu-red-secondary': '#E83F48',
        'dtu-green': '#008835',
        'dtu-purple': '#79238E',

        // DTU Blue variants for consistent UI
        'dtu-blue-50': '#EDEDFC',
        'dtu-blue-100': '#D6D7F9',
        'dtu-blue-200': '#ADAFF4',
        'dtu-blue-300': '#8487EE',
        'dtu-blue-400': '#5B5FE9',
        'dtu-blue-500': '#2F3EEA', // Base blue
        'dtu-blue-600': '#1927D5',
        'dtu-blue-700': '#121EA7',
        'dtu-blue-800': '#0C1579',
        'dtu-blue-900': '#030F4F', // Navy blue

        // DTU Red variants for consistent UI
        'dtu-red-50': '#F9D6D6',
        'dtu-red-100': '#F2ADAD',
        'dtu-red-200': '#E88585',
        'dtu-red-300': '#DE5C5C',
        'dtu-red-400': '#D53333',
        'dtu-red-500': '#BB0000',
        'dtu-red-600': '#990000', // Base red
        'dtu-red-700': '#770000',
        'dtu-red-800': '#550000',
        'dtu-red-900': '#330000',

        // DTU Green variants for consistent UI
        'dtu-green-50': '#D6F5E5',
        'dtu-green-100': '#ADF0CB',
        'dtu-green-200': '#85EAB1',
        'dtu-green-300': '#5CE596',
        'dtu-green-400': '#1FD082', // Bright green
        'dtu-green-500': '#00BF5F',
        'dtu-green-600': '#00A34C',
        'dtu-green-700': '#008835', // Base green
        'dtu-green-800': '#006026',
        'dtu-green-900': '#003817',
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'], // DTU often uses Arial or similar sans-serif fonts
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
