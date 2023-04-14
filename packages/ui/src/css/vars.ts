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
	padding: {
		auto: 'auto',
		inherit: 'inherit',
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
		small: '0 2px 8px -2px rgba(59, 59, 59, 0.08)',
		medium: '0 6px 12px -2px rgba(59, 59, 59, 0.12)',
	},
	overflow: ['auto', 'hidden', 'visible', 'scroll'],
	zIndex: {
		tooltip: 10,
	},
} as const
