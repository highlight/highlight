import { style } from '@vanilla-extract/css'

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
