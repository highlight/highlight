import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const codeBlock = style({
	backgroundColor: vars.theme.static.surface.raised,
	border: vars.border.dividerWeak,
	borderRadius: 6,
	display: 'block',
	position: 'relative',
})
