import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const ERROR_CARD_PX = 12

export const errorCardTitle = style({
	height: 20,
})

export const errorCardTitleText = style({
	maxWidth: '100%',
})

export const errorCard = style({
	selectors: {
		'&:hover': {
			background: colors.n2,
		},
	},
})

export const errorCardSelected = style({
	background: colors.neutral200,
	selectors: {
		'&:hover': {
			backgroundColor: colors.neutral200,
		},
	},
})
