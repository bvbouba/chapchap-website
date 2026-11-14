import TypographyPlugin from "@tailwindcss/typography";
import FormPlugin from "@tailwindcss/forms";
import ContainerQueriesPlugin from "@tailwindcss/container-queries";
import { type Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// Aligned with customer mobile: green brand + red CTA
				primary: { DEFAULT: "#A6C65A", light: "#C5E08A", dark: "#7FA33A" },
				secondary: { DEFAULT: "#EB1700", light: "#FF5A48", dark: "#C91400" },
				brand: { green: "#A6C65A", deep: "#3D5A1A", red: "#EB1700" },
			},
			fontFamily: {
				sans: ["Proxima Vara", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
			},
			// fontSize: {
			// 	base: ["14px", "1.4285714286"],
			// },
			maxWidth: {
				"6xl": "980px",
			},
		},
	},
	plugins: [TypographyPlugin, FormPlugin, ContainerQueriesPlugin],
};

export default config;
