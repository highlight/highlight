import { style } from '@vanilla-extract/css'

export const loadingOverlay = style({
	zIndex: 2,
})

export const graphWrapper = style({
	width: 720,
	height: 360,
	margin: 'auto',
	zIndex: 1,
	backgroundColor: '#fff',
})

export const chartWrapper = style({})

export const legendWrapper = style({
	left: -6,
	maxHeight: 72,
	paddingTop: 2,
	paddingBottom: 2,
	overflowY: 'auto',
})

export const legendDot = style({
	borderRadius: '50%',
	margin: 'auto',
	marginRight: '4px',
	width: 8,
	height: 8,
})

export const legendTextWrapper = style({
	maxWidth: 145,
	textAlign: 'left',
})

export const legendTextButton = style({
	height: 16,
})

export const titleText = style({
	lineHeight: '24px',
})
