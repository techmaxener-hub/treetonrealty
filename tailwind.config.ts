import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2.5rem",
        xl: "4rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Brand palette per project spec -- reference these directly when
        // semantic tokens above (primary/accent/etc.) aren't specific enough.
        // "emerald" is intentionally NOT redefined here: Tailwind's own
        // emerald-* scale already has emerald-600 = #059669, the spec's exact
        // value, and is already used natively elsewhere (e.g. badge
        // "verified") -- shadowing it would break those. "gold" is aliased to
        // Tailwind's amber-* scale for the same reason (amber-600 = #D97706
        // is the spec's exact gold value) -- use gold-400/500/600/700 etc.
        "slate-deep": {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          dark: "#020617",
        },
        alabaster: {
          DEFAULT: "#F8FAFC",
          dark: "#F1F5F9",
        },
        gold: colors.amber,
        "border-subtle": "rgba(23, 23, 23, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        serif: ["var(--font-serif-alt)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        // Primary CTA (emerald) and secondary/premium accent (gold) gradients.
        "emerald-gradient":
          "linear-gradient(135deg, #34D399 0%, #059669 45%, #047857 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #FBBF24 0%, #D97706 45%, #B45309 100%)",
        "slate-gradient":
          "linear-gradient(180deg, #1E293B 0%, #020617 100%)",
      },
      boxShadow: {
        elevate: "0 8px 30px -8px rgba(15, 23, 42, 0.25)",
        "elevate-lg": "0 20px 60px -12px rgba(15, 23, 42, 0.35)",
        primary: "0 8px 30px -6px rgba(5, 150, 105, 0.35)",
        gold: "0 8px 30px -6px rgba(217, 119, 6, 0.35)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2.5s linear infinite",
        marquee: "marquee 30s linear infinite",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
