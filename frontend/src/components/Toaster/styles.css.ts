import { style } from '@vanilla-extract/css'

export const toast = style({
	position: 'fixed',
	top: 0,
	right: 0,
	left: 0,
	zIndex: 100,
	padding: '1rem',
	display: 'flex',
	justifyContent: 'center',
})
