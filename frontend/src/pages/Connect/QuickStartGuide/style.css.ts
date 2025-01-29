import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const sectionToggle = style({
	position: 'absolute',
	right: 0,
	top: -6,
})

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
