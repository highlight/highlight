import { style } from '@vanilla-extract/css'
import { vars } from '../../../css/vars'

export const header = style({
	display: 'grid',
	gridTemplateColumns: '100px 80px 80px',
	gridGap: 6,
	borderBottom: `1px solid ${vars.theme.interactive.fill.secondary.pressed}`,
	padding: '12px 14px 10px',
})
