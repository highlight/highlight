import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const sectionToggle = style({
	position: 'absolute',
	right: 0,
	top: -6,
})

export const codeBlock = style({
	border: vars.border.dividerWeak,
	borderRadius: 6,
})

export const code = globalStyle(`${codeBlock} code`, {
	paddingBottom: `8px !important`,
	paddingTop: `8px !important`,
})
