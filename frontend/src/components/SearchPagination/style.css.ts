import { borders } from '@highlight-run/ui/borders'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const simple = style({
	borderRadius: 0,
	border: '0 !important',
	selectors: {
		'&:focus, &:active': {
			background: 'inherit',
		},
	},
})

export const rightBorder = style({
	borderRight: `${borders.secondary} !important`,
})

export const selected = style({
	background: vars.theme.interactive.fill.secondary.hover,
	selectors: {
		'&:focus, &:active': {
			background: vars.theme.interactive.fill.secondary.pressed,
		},
	},
})
