import TypographyPlugin from "@tailwindcss/typography";
import FormPlugin from "@tailwindcss/forms";
import ContainerQueriesPlugin from "@tailwindcss/container-queries";
import { type Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: { DEFAULT: "#97D700", light: "#B8F24A", dark: "#6FA300" },
				secondary: { DEFAULT: "#44474A", light: "#6B6E71", dark: "#2C2E30" },
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
