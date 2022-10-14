import { createTheme } from '@vanilla-extract/css'

export const [themeClass, vars] = createTheme({
	primary: '#1E40AF',
	secondary: '#DB2777',
	background: '#EFF6FF',
	text: {
		normal: '#1F2937',
		dimmed: '#6B7280',
	},
})

export const [darkThemeClass, darkVars] = createTheme(vars, {
	primary: '#60A5FA',
	secondary: '#F472B6',
	background: '#1F2937',
	text: {
		normal: '#F9FAFB',
		dimmed: '#D1D5DB',
	},
})
