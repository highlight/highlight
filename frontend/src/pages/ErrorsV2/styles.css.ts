import { style } from '@vanilla-extract/css'

export const searchPanelContainer = style({
	position: 'relative',
	zIndex: 98,
})

export const detailsContainer = style({
	backgroundColor: '#f9f8f9',
	flexGrow: 1,
	height: '100%',
	padding: '8px',
})

export const errorMetrics = style({
	display: 'flex',
	gap: 'var(--size-medium)',
	marginTop: 'var(--size-medium)',
	width: '100%',
})

export const sessionSwitchButton = style({
	border: '0 !important',
	borderRadius: '0',
})

export const panelDragHandle = style({
	cursor: 'col-resize',
	position: 'absolute',
	right: -2,
	top: 0,
	bottom: 0,
	width: 4,
})
