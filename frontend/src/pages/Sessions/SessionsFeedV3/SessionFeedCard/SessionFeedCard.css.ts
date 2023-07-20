import { borders } from '@highlight-run/ui/src/css/borders'
import { colors } from '@highlight-run/ui/src/css/colors'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
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
			background: themeVars.interactive.overlay.secondary.hover,
		},
	},
})

export const sessionCardSelected = style({
	background: themeVars.interactive.overlay.secondary.selected.default,
	boxShadow: borders.secondaryInner,
	selectors: {
		'&:hover': {
			backgroundColor:
				themeVars.interactive.overlay.secondary.selected.hover,
		},
	},
})
