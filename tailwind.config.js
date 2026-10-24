/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        ticketbox: {
          green: "#00b14f",
          darkGreen: "#009241",
          lightGreen: "#e8f8f0",
          orange: "#ff5722",
          dark: "#1e2329",
          navy: "#131a29",
          gray: "#f4f6f8",
        },
        tickticket: {
          green: "#1b7a3e",
          accent: "#22c55e",
          subgreen: "#529c32",
          darkGreen: "#15803d",
          lightGreen: "#e8f8f0",
          dark: "#1e2329",
          navy: "#131a29",
        },
      },
    },
  },
  plugins: [],
};