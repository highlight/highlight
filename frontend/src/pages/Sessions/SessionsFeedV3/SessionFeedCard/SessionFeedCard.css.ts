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

export const datetimeText = style({
	color: colors.neutralN11,
})

export const activityGraph = style({
	cursor: 'pointer',
	paddingTop: 2,
	width: 80,
})

export const sessionCard = style({
	selectors: {
		'&:hover': {
			background: colors.neutralN4,
		},
	},
})

export const sessionCardSelected = style({
	background: colors.neutralN5,
	selectors: {
		'&:hover': {
			backgroundColor: colors.neutralN5,
		},
	},
})
