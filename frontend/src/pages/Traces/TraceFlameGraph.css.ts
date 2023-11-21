import { style } from '@vanilla-extract/css'

export const flameGraph = style({
	'::-webkit-scrollbar': {
		WebkitAppearance: 'none',
		height: 7,
		width: 7,
	},

	'::-webkit-scrollbar-thumb': {
		borderRadius: 4,
		backgroundColor: 'rgba(0, 0, 0, .5)',
		boxShadow: '0 0 1px rgba(255, 255, 255, .5)',
	},
})
