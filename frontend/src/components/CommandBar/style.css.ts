import { style } from '@vanilla-extract/css'

export const dialog = style({
	zIndex: 99999,
	backgroundColor: 'rgba(111, 110, 119, 0.48)',
	height: '100vh',
	width: '100vw',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
})

export const searchIcon = style({ flexShrink: 0 })

export const content = style({})
