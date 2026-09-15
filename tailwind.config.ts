import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0C0E",
        surface: "#121418",
        surfaceElevated: "#181B20",
        borderSubtle: "#22252C",
        borderLight: "#2E333D",
        accentLime: "#D5FA3C",
        accentLimeHover: "#C4E82E",
        textPrimary: "#F5F6F8",
        textSecondary: "#9BA1AD",
        textMuted: "#636A78",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        'glow-lime': '0 0 20px -3px rgba(213, 250, 60, 0.25)',
        'subtle': '0 2px 8px 0 rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;
