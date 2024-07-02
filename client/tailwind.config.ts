import { type Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.tsx'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['ui-sans-serif', 'system-ui'],
				serif: ['ui-serif', 'Georgia'],
				mono: ['Monaco', 'ui-monospace', 'SFMono-Regular'],
				display: ['Oswald'],
				body: ['Open Sans'],
			},
		},
		colors: {
			electricblue: '#3b72ff',
			bigred: '#f6613c',
			bellow: '#ffc83b',
			verygreen: '#72c56d',
			brightwhite: '#ffffff',
			black: '#000000',
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
		backgroundImage: {
			auctionsfade: 'radial-gradient(circle at 50% 100%, #f54325, transparent)',
			itemfade: 'linear-gradient(to left, #1f3745, transparent)',
			paymentbtnfade: 'radial-gradient(circle at 50% 100%, #f99270, transparent)',
			offerbtnfade: 'radial-gradient(circle at 50% 100%, #f06342, transparent)',
			productbtnfade: 'radial-gradient(circle at 50% 100%, #fa3412, transparent)',
			aboutgobtnfade: 'radial-gradient(circle at 50% 100%, #e12615, transparent)',
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				sliced: {
					primary: '#FFFFFF',
					secondary: '#FF603B',
					accent: '#193646',
					darkaccent: '#0e1720',
					neutral: '#6b7280',
					'base-100': '#121A24',
					info: '#f3f4f6',
					success: '#22c55e',
					warning: '#fde047',
					error: '#ef4444',
					'electric-blue': '#3b72ff',
				},
			},
		],
	},
} satisfies Config;
