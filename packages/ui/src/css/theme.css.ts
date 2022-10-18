import { createGlobalTheme, createTheme } from '@vanilla-extract/css'
import { borders } from './borders'
import { breakpoints } from './breakpoints'
import { colors } from './colors'
import { spaces } from './spaces'

export const vars = createGlobalTheme(':root', {
	breakpoint: breakpoints,
	color: colors,
	space: spaces,
	border: borders,
	borderRadius: {
		standard: '4px',
		large: '8px',
		xlarge: '12px',
	},
	typography: {
		family: {
			body: 'Steradian, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
			header: 'Steradian, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif',
			monospace: 'Roboto Mono, monospace',
		},
		fontMetrics: {
			capHeight: '1443',
			ascent: '1950',
			descent: '-494',
			lineGap: '0',
			unitsPerEm: '2048',
		},
		fontWeight: {
			standard: '400',
			medium: '500',
			strong: '700',
		},
		heading: {
			weight: {
				weak: 'standard',
				standard: 'strong',
			},
			h1: {
				fontSize: '52px',
			},
			h2: {
				fontSize: '38px',
			},
			h3: {
				fontSize: '22px',
			},
			h4: {
				fontSize: '18px',
			},
		},
		text: {
			xsmall: {
				fontSize: '14px',
			},
			small: {
				fontSize: '16px',
			},
			standard: {
				fontSize: '18px',
			},
			large: {
				fontSize: '22px',
			},
		},
	},
	transforms: {
		touchable: 'scale(0.97)',
	},
	transitions: {
		fast: 'transform .125s ease, opacity .125s ease',
		touchable: 'transform 0.2s cubic-bezier(0.02, 1.505, 0.745, 1.235)',
	},
	shadows: {
		small: '0 2px 4px 0px rgba(28,28,28,.1), 0 2px 2px -2px rgba(28,28,28,.1), 0 4px 4px -4px rgba(28,28,28,.2)',
		medium: '0 2px 4px 0px rgba(28,28,28,.1), 0 8px 8px -4px rgba(28,28,28,.1), 0 12px 12px -8px rgba(28,28,28,.2)',
		large: '0 2px 4px 0px rgba(28,28,28,.1), 0 12px 12px -4px rgba(28,28,28,.1), 0 20px 20px -12px rgba(28,28,28,.2)',
	},
})

export const [lightThemeClass, lightVars] = createTheme({
	color: {
		body: colors.white,
		text: {
			primary: colors.black,
		},
	},
})

export const darkThemeClass = createTheme(lightVars, {
	color: {
		body: colors.purple900,
		text: {
			primary: colors.white,
		},
	},
})
