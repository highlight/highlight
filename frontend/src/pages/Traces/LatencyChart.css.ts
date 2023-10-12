import { style } from '@vanilla-extract/css'

export const legendValue = style({
	color: 'var(--color-gray-500) !important',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
})

export const notShowingValue = style({
	textDecoration: 'line-through',
})

export const legendIcon = style({
	borderRadius: '50%',
	flexShrink: 0,
	height: '6px',
	marginBottom: 'auto',
	marginTop: 'auto',
	width: '6px',
})

export const notShowingIcon = style({
	filter: 'grayscale(0.5)',
})
