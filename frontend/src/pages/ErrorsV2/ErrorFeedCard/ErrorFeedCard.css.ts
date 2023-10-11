import { borders } from '@highlight-run/ui/src/css/borders'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
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
			background: themeVars.interactive.overlay.secondary.hover,
		},
	},
})

export const errorCardSelected = style({
	background: themeVars.interactive.overlay.secondary.selected.default,
	boxShadow: borders.secondaryInner,
	selectors: {
		'&:hover': {
			backgroundColor:
				themeVars.interactive.overlay.secondary.selected.hover,
		},
	},
})

export const errorCardTagText = style({
	maxWidth: 110,
})
