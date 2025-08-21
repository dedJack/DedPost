/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
   extend: {
  colors: {
    border: "hsl(214, 20%, 65%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(210, 15%, 20%)",

    primary: {
      DEFAULT: "#007bff",  // 👈 this adds bg-primary
      50: "#f5faff",
      100: "#e0f2ff",
      200: "#b9e3ff",
      300: "#7cc8ff",
      400: "#36a8ff",
      500: "#007bff",
      600: "#005fd6",
      700: "#0042a8",
      800: "#002d73",
      900: "#001944",
    },
  },
}

  },
  plugins: [],
}
