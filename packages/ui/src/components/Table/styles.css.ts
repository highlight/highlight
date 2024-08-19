import { style } from '@vanilla-extract/css'

import { vars } from '@/vars'

export const BORDER = `1px solid ${vars.theme.static.divider.weak}`

export const table = style({
	border: BORDER,
	borderRadius: vars.borderRadius['8'],
})

export const noBorder = style({
	border: 0,
})
