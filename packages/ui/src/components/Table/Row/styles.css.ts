import { style } from '@vanilla-extract/css'
import { vars } from '../../../css/vars'

export const row = style({
	display: 'grid',
	border: `1px solid ${vars.theme.static.divider.weak}`,
	padding: '12px 14px 10px',
	width: '100%',
})

export const header = style({})
