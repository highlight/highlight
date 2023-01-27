import { borderRadii, borders, borderWidths } from './borders'
import { breakpoints } from './breakpoints'
import { colors } from './colors'
import { spaces } from './spaces'
import { themeVars } from './theme.css'

export const vars = {
	breakpoint: breakpoints,
	color: colors,
	space: spaces,
	theme: themeVars,
	margin: {
		auto: 'auto',
		...spaces,
	},
	border: borders,
	borderRadius: borderRadii,
	borderWidth: borderWidths,
	borderStyle: {
		standard: 'solid',
	},
	transforms: {
		touchable: 'scale(0.97)',
	},
	transitions: {
		fast: 'transform .125s ease, opacity .125s ease',
		touchable: 'transform 0.2s cubic-bezier(0.02, 1.505, 0.745, 1.235)',
	},
	shadows: {
		small: '0px 6px 12px -2px rgba(59, 59, 59, 0.12)',
		medium: '0 2px 4px 0px rgba(28,28,28,.1), 0 8px 8px -4px rgba(28,28,28,.1), 0 12px 12px -8px rgba(28,28,28,.2)',
		large: '0 2px 4px 0px rgba(28,28,28,.1), 0 12px 12px -4px rgba(28,28,28,.1), 0 20px 20px -12px rgba(28,28,28,.2)',
	},
	overflow: ['auto', 'hidden', 'visible', 'scroll'],
	zIndex: {
		tooltip: 10,
	},
} as const
