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
		colors: {
			white: '#ffffff',
			black: '#000000',
			'purple-light': '#d4d8f2',
			purple: '#5362c8',
			'purple-dark': '#3543a7',
			orange: '#ff603b',
			'orange-dark': '#ff451a',
			'light-grey': '#cdcdcd',
			'medium-grey': '#a9a9a9',
			'dark-grey': '#767676',
			'red-error': '#ff4c4c',
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
