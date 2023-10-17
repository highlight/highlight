import { vars } from '@highlight-run/ui/src/css/vars'
import { style } from '@vanilla-extract/css'

export const container = style({
	background: vars.theme.static.surface.raised,
	borderRadius: 6,
	padding: 8,
})

export const cardStep = style({
	padding: 8,
})
