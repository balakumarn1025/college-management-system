import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [tailwindcss()],
  cssMinify: "esbuild",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563eb", foreground: "#ffffff" },
      },
    },
  },
};