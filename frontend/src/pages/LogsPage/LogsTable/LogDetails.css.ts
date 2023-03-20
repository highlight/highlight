import { style } from '@vanilla-extract/css'

export const line = style({
	selectors: {
		'& &': {
			paddingLeft: 22,
		},
	},
})

export const logAttributeLine = style({})

export const attributeActions = style({
	alignItems: 'center',
	display: 'none',
	flexDirection: 'row',
	gap: 4,
	opacity: 0.5,
	selectors: {
		'&:hover': {
			opacity: 1,
		},
		[`${logAttributeLine}:hover &`]: {
			display: 'flex',
		},
	},
})

export const attributeAction = style({
	opacity: 0.6,
	selectors: {
		'&:hover': {
			opacity: 1,
		},
	},
})
