import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const loadingOverlay = style({
	zIndex: 2,
	backdropFilter: 'grayscale(50%)',
})

export const loadingText = style({
	border: vars.border.divider,
	padding: 4,
	borderRadius: 4,
	backgroundColor: vars.color.white,
})

export const graphWrapper = style({
	width: 720,
	height: 360,
	margin: 'auto',
	zIndex: 1,
	backgroundColor: vars.color.white,
})

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
