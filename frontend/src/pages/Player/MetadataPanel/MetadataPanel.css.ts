import { style } from '@vanilla-extract/css'

export const container = style({
	height: '100%',
	width: '100%',
	display: 'flex',
	overflowY: 'auto',
	position: 'relative',
})

export const metadataPanel = style({
	height: '100%',
	width: '100%',
	position: 'absolute',
	top: '0px',
})
