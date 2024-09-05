import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const loadingOverlay = style({
	zIndex: 2,
	pointerEvents: 'none',
})

export const loadingText = style({
	border: vars.border.divider,
	padding: 4,
	borderRadius: 4,
	backgroundColor: vars.color.white,
})

export const legendWrapper = style({
	left: -6,
	flexShrink: 0,
	maxHeight: 42,
	paddingTop: 2,
	paddingBottom: 2,
	overflowY: 'auto',
	display: 'flex',
	flexWrap: 'wrap',
	rowGap: 6,
})

export const legendDot = style({
	borderRadius: '50%',
	margin: 'auto',
	marginRight: '4px',
	width: 8,
	height: 8,
	flexShrink: 0,
})

export const legendTextWrapper = style({
	textAlign: 'left',
})

export const legendTextButton = style({
	height: 16,
	flex: '1 0 calc(100% / 3)',
	maxWidth: 'fit-content',
})

export const titleText = style({
	lineHeight: '24px',
	height: '24px',
	alignItems: 'center',
	display: 'flex',
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

export const tooltipRow = style({
	maxWidth: '350px',
})

export const exemplarButton = style({
	height: '16px',
	width: '16px',
})

export const tooltipDot = style({
	borderRadius: '50%',
	width: 8,
	height: 8,
	flexShrink: 0,
	flexGrow: 0,
})

export const disabled = style({
	pointerEvents: 'none',
})

export const hoverCard = style({
	width: 'min-content',
})

export const tickText = style({
	userSelect: 'none',
})
