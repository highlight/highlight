/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['{src,public}/**/*.{js,jsx,ts,tsx}', 'index.html'],
	theme: {
		extend: {
			blur: {
				xs: '2px',
			},
			colors: {
				'primary-1': '#B19CFF',
				'primary-2': '#6C37F4',
				'primary-3': '#5420D1',
				'primary-4': '#0D0225',

				'secondary-1': '#B9F2FE',
				'secondary-2': '#72E4FC',
				'secondary-3': '#23B6E2',
				'secondary-4': '#0B75AA',

				'highlight-1': '#EBFF5E',
				'highlight-2': '#8DC31A',

				selection: '#EBFF5E',
				error: '#FF5377',
				warning: '#FF9457',
				success: '#36E79B',
				midnight: '#0D0225',
				'pale-purple': '#645D74',
			},
			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
			},
		},
	},
	plugins: [],
	corePlugins: {
		preflight: false,
	},
	important: true,
}
