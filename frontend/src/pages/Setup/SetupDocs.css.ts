import { vars } from '@highlight-run/ui'
import { globalStyle, style } from '@vanilla-extract/css'

export const codeBlock = style({
	backgroundColor: vars.theme.static.surface.raised,
	border: vars.border.dividerWeak,
	borderRadius: 6,
	display: 'block',
	padding: 0,
	position: 'relative',
})

export const code = globalStyle(`${codeBlock} code`, {
	paddingBottom: `8px !important`,
	paddingTop: `8px !important`,
})
