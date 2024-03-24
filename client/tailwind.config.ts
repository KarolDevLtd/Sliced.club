import { type Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.tsx'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['ui-sans-serif', 'system-ui'],
				serif: ['ui-serif', 'Georgia'],
				mono: ['ui-monospace', 'SFMono-Regular'],
				display: ['Oswald'],
				body: ['Open Sans'],
			},
		},
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
		},
	},
	plugins: [],
} satisfies Config;
