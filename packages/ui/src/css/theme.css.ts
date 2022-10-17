import { createGlobalTheme, createTheme } from '@vanilla-extract/css'
import colors from './colors'
import spaces from './spaces'

export const baseTheme = createGlobalTheme(':root', {
	body: {
		lineHeight: '1em',
	},
	text: {
		bodyFontFamily:
			'Steradian, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
		headerFontFamily:
			'Steradian, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif',
		monospaceFontFamily: 'Roboto Mono, monospace',
	},
	space: spaces,
})

export const [lightThemeClass, vars] = createTheme({
	color: {
		body: colors.white,
		text: {
			primary: colors.black,
		},
	},
})

export const darkThemeClass = createTheme(vars, {
	color: {
		body: colors.purple900,
		text: {
			primary: colors.white,
		},
	},
})
