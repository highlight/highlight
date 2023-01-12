import { style } from '@vanilla-extract/css'

export const container = style({
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	width: '100%',
})

export const overflowText = style({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	lineHeight: '20px',
})
