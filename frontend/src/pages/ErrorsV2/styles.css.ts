import { style } from '@vanilla-extract/css'

export const container = style({
	display: 'flex',
	width: '100%',
})

export const searchPanelContainer = style({
	position: 'relative',
	zIndex: 98,
})

export const detailsContainer = style({
	backgroundColor: '#f9f8f9',
	display: 'flex',
	flexDirection: 'column',
	flexGrow: '1',
	height: '100%',
	padding: '8px',
})

export const errorDetails = style({
	background: 'white',
	borderRadius: '4px',
	display: 'flex',
	height: '100%',
	marginLeft: '0',
	overflowY: 'scroll',
	width: '100%',
})

export const errorMetrics = style({
	display: 'flex',
	gap: 'var(--size-medium)',
	marginTop: 'var(--size-medium)',
})

export const moveDetailsRight = style({
	marginLeft: '340px',
})

export const sessionSwitchButton = style({
	border: '0 !important',
	borderRadius: '0',
})
