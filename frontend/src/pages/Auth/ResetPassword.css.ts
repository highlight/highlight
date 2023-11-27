import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const backButton = style({
	color: vars.theme.static.content.default,
	position: 'absolute',
	left: 0,
	top: -2,
})
