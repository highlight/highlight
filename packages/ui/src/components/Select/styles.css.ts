import { style } from '@vanilla-extract/css'

import { vars } from '@/vars'

export const item = style({
	selectors: {
		'&[data-active-item]': {
			backgroundColor: vars.theme.static.surface.elevated,
		},
	},
})

export const popover = style({})
