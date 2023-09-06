import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const formTitle = style({
	fontSize: 36,
	fontWeight: '700 !important',
	color: vars.theme.static.content.default,
	selectors: {
		'&:focus': {
			outline: 0,
		},
		'&::placeholder': {
			color: vars.theme.interactive.fill.secondary.content.onDisabled,
		},
	},
})
