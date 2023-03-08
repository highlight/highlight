import { vars } from '@highlight-run/ui'
import { borders } from '@highlight-run/ui/src/css/borders'
import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const histogramContainer = style({
	height: '3.86rem', // computed in Chrome as 48px
})

export const hover = style({
	cursor: 'pointer',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const popoverContent = style({
	backgroundColor: vars.theme.static.surface.default,
	zIndex: '10 !important',
	border: borders.divider,
	boxShadow: vars.shadows.medium,
	borderRadius: 6,
	width: 224,
})

export const popoverContentRow = style({
	height: 28,
})

export const dragSelection = style({
	backgroundColor: colors.n7,
	opacity: 0.5,
})
