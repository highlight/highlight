import { vars } from '@highlight-run/ui'
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
			background: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const errorCardSelected = style({
	background: vars.theme.interactive.overlay.secondary.pressed,
	boxShadow: `0 -1px 0 0 rgba(0, 0, 0, 0.1) inset`,
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.pressed,
		},
	},
})

export const snoozedTag = style({
	display: 'block',
})
