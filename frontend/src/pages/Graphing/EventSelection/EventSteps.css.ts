import { style } from '@vanilla-extract/css'
import { vars } from '@highlight-run/ui/vars'

export const eventStep = style({
	border: vars.border.secondary,
	borderTop: 'none',

	selectors: {
		'&:first-child': {
			borderTopLeftRadius: 4,
			borderTopRightRadius: 4,
			borderTop: vars.border.secondary,
		},
		'&:last-child': {
			borderBottomLeftRadius: 4,
			borderBottomRightRadius: 4,
		},
	},
})

export const discoverableButton = style({
	visibility: 'hidden',

	selectors: {
		[`${eventStep}:hover &`]: {
			visibility: 'visible',
		},
	},
})
