import { style } from '@vanilla-extract/css'

export const container = style({
	height: '100%',
	width: '100%',
	paddingTop: 16,
})

export const emptyContainer = style({
	height: '100%',
	width: '100%',
	padding: 24,
	paddingTop: 0,
})

export const messageContainer = style({
	alignItems: 'center',
	display: 'flex',
	height: '100%',
	justifyContent: 'center',
})

export const noDataContainer = style({
	alignItems: 'center',
	display: 'flex',
	height: '50%',
	justifyContent: 'center',
})
