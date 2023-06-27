import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const insight = style({
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	padding: 8,
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.overlay.secondary.hover,
		},
	},
	width: '100%',
})
