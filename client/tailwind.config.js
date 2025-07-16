// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CONVERTED TO HEX, RGB, or HSL
        'custom-primary': '#69B264', // Example conversion
        'another-color': 'rgba(128, 128, 128, 0.8)', // Example conversion
        // ... converted any other custom colors
      },
      // ... other extensions
    },
  },
  plugins: [],
}