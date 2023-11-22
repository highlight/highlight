import { vars } from '@highlight-run/ui/vars'
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

export const insightPanel = style({
	maxHeight:
		'calc(100vh - 160px - 32px - 42px - 32px - var(--header-height))',
})

export const insightPanelWithBanner = style({
	maxHeight:
		'calc(100vh - 160px - 32px - 42px - 32px - var(--header-height) - var(--banner-height))',
})
