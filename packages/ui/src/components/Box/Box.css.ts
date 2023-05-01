import { style } from '@vanilla-extract/css'

export const hiddenScroll = style({
	msOverflowStyle: 'none',
	scrollbarWidth: 'none',
	selectors: {
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
})
