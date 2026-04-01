/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Fixed: comma instead of dot
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
