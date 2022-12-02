import { borders } from '@highlight-run/ui/src/css/borders'
import { vars } from '@highlight-run/ui/src/css/vars'
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
	borderRight: `${borders.neutral} !important`,
})

export const selected = style({
	background: vars.color.neutral100,
	selectors: {
		'&:focus, &:active': {
			background: vars.color.neutral100,
		},
	},
})
