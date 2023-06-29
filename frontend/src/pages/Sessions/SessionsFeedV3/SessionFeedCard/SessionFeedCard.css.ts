import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const SESSION_CARD_PX = 12

export const sessionCardTitle = style({
	alignItems: 'center',
	display: 'flex',
	height: 20,
	justifyContent: 'space-between',
})

export const sessionCardTitleText = style({
	maxWidth: '100%',
})

export const sessionMeta = style({
	color: colors.n11,
})

export const activityGraph = style({
	cursor: 'pointer',
	paddingTop: 2,
	width: 80,
})

export const sessionCard = style({
	selectors: {
		'&:hover': {
			background: colors.n4,
		},
	},
})

export const sessionCardSelected = style({
	background: colors.n5,
	selectors: {
		'&:hover': {
			backgroundColor: colors.n5,
		},
	},
})
