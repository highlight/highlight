import { style } from '@vanilla-extract/css'

export const modalInner = style({
	margin: 'auto',
	overflow: 'clip',
	minWidth: 320,
	minHeight: 700,
	width: 1000,
	height: 900,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	position: 'relative',
	pointerEvents: 'auto',
	transition: 'all',
})

export const closeIcon = style({
	position: 'absolute',
	top: 32,
	right: 32,
})
