import { type Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import animatePlugin from 'tailwindcss-animate'
import radixPlugin from 'tailwindcss-radix'
import { marketingPreset } from './app/routes/_marketing+/tailwind-preset'
import { extendedTheme } from './app/utils/extended-theme.ts'

export default {
	content: ['./app/**/*.{ts,tsx,jsx,js}'],
	darkMode: 'class',
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: extendedTheme,
		textShadow: {
			sm: '0 1px 2px var(--tw-shadow-color)',
			DEFAULT: '0 0 12px var(--tw-shadow-color)',
			lg: '0 8px 16px var(--tw-shadow-color)',
		},
	},
	presets: [marketingPreset],
	plugins: [
		require('tailwindcss-radix')(),
		animatePlugin,
		radixPlugin,
		plugin(function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					'text-shadow': (value) => ({
						textShadow: value,
					}),
				},
				{ values: theme('textShadow') },
			)
		}),
	],
} satisfies Config
