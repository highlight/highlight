import { style } from '@vanilla-extract/css'

export const grid = style({
	display: 'grid',
	gridTemplateColumns: '1fr 100px 100px',
	gridColumnGap: 40,
})
