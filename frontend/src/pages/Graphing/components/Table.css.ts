import { style } from '@vanilla-extract/css'

export const tableWrapper = style({
	marginLeft: -8,
	marginRight: -8,
})

export const fullHeight = style({
	height: 'calc(100% - 50px)',
})

export const tableHeader = style({
	overflowY: 'hidden',
	scrollbarGutter: 'stable',
})

export const scrollableBody = style({
	overflowY: 'auto',
	scrollbarGutter: 'stable',
})

export const preventScroll = style({
	overflowY: 'hidden',
})

export const firstCell = style({
	minWidth: '106px',
})

export const tableRow = style({
	overflow: 'hidden',
})
