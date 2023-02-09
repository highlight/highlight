import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const select = style({
	borderRadius: 6,
	border: vars.border.secondary,
	padding: '4px 6px',
	fontSize: 13,
	color: vars.theme.static.content.default,
	caretColor: vars.theme.interactive.fill.primary.enabled,
	outline: 0,
	width: '100%',
	selectors: {
		'&::placeholder': {
			color: vars.theme.interactive.fill.secondary.content.onDisabled,
		},
		'&:disabled': {
			background: vars.color.n5,
		},
		'&:focus': {
			border: vars.border.secondaryPressed,
		},
	},
})
