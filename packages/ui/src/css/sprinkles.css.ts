import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import { createGlobalTheme, createTheme } from '@vanilla-extract/css'
import colors from './colors'
import spaces from './spaces'

export const baseTheme = createGlobalTheme(':root', {
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

const responsiveProperties = defineProperties({
	conditions: {
		mobile: {},
		tablet: { '@media': 'screen and (min-width: 768px)' },
		desktop: { '@media': 'screen and (min-width: 1024px)' },
	},
	defaultCondition: 'mobile',
	properties: {
		display: ['none', 'flex', 'block', 'inline'],
		flexDirection: ['row', 'column'],
		justifyContent: [
			'stretch',
			'flex-start',
			'center',
			'flex-end',
			'space-around',
			'space-between',
		],
		alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
		padding: spaces,
		paddingTop: spaces,
		paddingBottom: spaces,
		paddingLeft: spaces,
		paddingRight: spaces,
	},
	shorthands: {
		p: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
		padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
		pX: ['paddingLeft', 'paddingRight'],
		paddingX: ['paddingLeft', 'paddingRight'],
		pY: ['paddingTop', 'paddingBottom'],
		paddingY: ['paddingTop', 'paddingBottom'],
		placeItems: ['justifyContent', 'alignItems'],
	},
})

const colorProperties = defineProperties({
	conditions: {
		lightMode: {},
		darkMode: { '@media': '(prefers-color-scheme: dark)' },
	},
	defaultCondition: 'lightMode',
	properties: {
		color: colors,
		background: colors,
	},
})

export const sprinkles = createSprinkles(responsiveProperties, colorProperties)

export type Sprinkles = Parameters<typeof sprinkles>[0]
