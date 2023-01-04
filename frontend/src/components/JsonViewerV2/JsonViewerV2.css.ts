import { style } from '@vanilla-extract/css'

export const container = style({
	position: 'relative',
	fontSize: 13,
	width: '100%',
})

export const downloadButton = style({
	position: 'absolute',
	right: 0,
	zIndex: 5,
})
