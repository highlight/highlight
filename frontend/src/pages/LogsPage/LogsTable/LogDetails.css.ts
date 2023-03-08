import { vars } from '@highlight-run/ui/src'
import { style } from '@vanilla-extract/css'

export const line = style({
	selectors: {
		'& &': {
			paddingLeft: 22,
		},
	},
})
