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

export const moveDetailsRight = style({
	marginLeft: '340px',
})

export const sessionSwitchButton = style({
	border: '0 !important',
	borderRadius: '0',
})
