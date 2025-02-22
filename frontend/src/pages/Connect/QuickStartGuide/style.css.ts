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

globalStyle(`${codeBlock} code`, {
	paddingBottom: `8px !important`,
	paddingTop: `8px !important`,
})

export const markdown = style({})

globalStyle(`${markdown} p`, {
	lineHeight: `24px !important`,
})
