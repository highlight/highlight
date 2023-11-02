import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const row = style({
	borderRadius: 6,
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const rowExpanded = style({
	background: vars.theme.interactive.overlay.secondary.pressed,
})

export const textHighlight = style({
	backgroundColor: vars.theme.static.surface.sentiment.caution,
	borderRadius: 4,
	color: 'inherit !important', // override styles from the highlighter component
	display: 'inline-block',
	padding: '0 4px',
})
