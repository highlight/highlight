import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const menuList = style({
	padding: 0,
	paddingBottom: 4,
})

export const menuOption = style({
	color: vars.theme.interactive.fill.secondary.content.text,
})

export const issueButton = style({
	maxWidth: 108,
})
