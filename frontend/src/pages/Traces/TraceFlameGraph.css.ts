import { style } from '@vanilla-extract/css'

export const flameGraph = style({
	maxHeight: 400,
	'::-webkit-scrollbar-corner': {
		backgroundColor: 'transparent',
	},
})
