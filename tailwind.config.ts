import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        background: "#0E0E16",
        module: "#29293D",
        toolbar: "#1E1E2E",
        outline: "#414184",
        button: "#6666D4",
        "button-hover": "#4848C9",
        "button-light": "#29293D",
        "subtext": "#A6A6A6",
      }
    },
    
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          "primary": "#6666D4",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
} satisfies Config;
