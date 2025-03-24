import { style } from '@vanilla-extract/css'

const POPOVER_WIDTH = 300

export const selectButton = style({
	border: 'none',
	padding: '8px 4px',
	width: '100%',
})

export const selectPopover = style({
	width: POPOVER_WIDTH,
	zIndex: 1000,
})

export const selectOption = style({
	lineHeight: '25px',
	overflow: 'hidden',
	width: POPOVER_WIDTH - 50,
})
