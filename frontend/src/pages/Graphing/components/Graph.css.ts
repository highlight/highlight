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
	height: '24px',
})

export const hiddenMenu = style({
	visibility: 'hidden',
})

export const tooltipWrapper = style({
	backgroundColor: 'white',
	border: vars.border.divider,
	borderRadius: '6px',
	minWidth: '100px',
	display: 'flex',
	flexDirection: 'column',
	gap: '6px',
	padding: '8px',
})

export const tooltipText = style({
	lineHeight: '16px',
})

export const tooltipDot = style({
	borderRadius: '50%',
	marginRight: '4px',
	width: 8,
	height: 8,
})
