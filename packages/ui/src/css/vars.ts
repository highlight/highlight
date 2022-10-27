import { borders } from './borders'
import { breakpoints } from './breakpoints'
import { colors } from './colors'
import { spaces } from './spaces'

export const vars = {
	breakpoint: breakpoints,
	color: colors,
	space: spaces,
	border: borders,
	borderRadius: {
		xSmall: '3px',
		small: '4px',
		medium: '6px',
		large: '8px',
		xLarge: '12px',
		round: '999px',
	},
	borderWidth: {
		small: '1px',
		medium: '2px',
		large: '4px',
	},
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
		small: '0 2px 4px 0px rgba(28,28,28,.1), 0 2px 2px -2px rgba(28,28,28,.1), 0 4px 4px -4px rgba(28,28,28,.2)',
		medium: '0 2px 4px 0px rgba(28,28,28,.1), 0 8px 8px -4px rgba(28,28,28,.1), 0 12px 12px -8px rgba(28,28,28,.2)',
		large: '0 2px 4px 0px rgba(28,28,28,.1), 0 12px 12px -4px rgba(28,28,28,.1), 0 20px 20px -12px rgba(28,28,28,.2)',
	},
}
