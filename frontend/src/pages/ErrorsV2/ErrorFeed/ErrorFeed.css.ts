import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const ERROR_FEED_SCROLLBAR_WIDTH = 8
export const content = style({
	overflowX: 'hidden',
	overflowY: 'auto',
	selectors: {
		'&::-webkit-scrollbar': {
			backgroundColor: colors.neutral50,
			width: ERROR_FEED_SCROLLBAR_WIDTH,
		},
		'&::-webkit-scrollbar-thumb': {
			backgroundColor: colors.neutral100,
		},
	},
})

export const pagination = style({
	margin: 0,
})
