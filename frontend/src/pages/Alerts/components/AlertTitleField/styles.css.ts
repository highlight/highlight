import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const formTitle = style({
	fontSize: 36,
	fontWeight: '700 !important',
	color: vars.theme.static.content.default,
	width: '100%',
	selectors: {
		'&:focus': {
			outline: 0,
		},
		'&::placeholder': {
			color: vars.theme.interactive.fill.secondary.content.onDisabled,
		},
	},
})
