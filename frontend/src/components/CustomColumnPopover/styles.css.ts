import { style } from '@vanilla-extract/css'

const POPOVER_WIDTH = 300

export const selectButton = style({
	border: 'none',
})

export const selectPopover = style({
	width: POPOVER_WIDTH,
})

export const selectOption = style({
	lineHeight: '25px',
	overflow: 'hidden',
	width: POPOVER_WIDTH - 50,
})

export const selectOptionTooltip = style({
	overflowWrap: 'break-word',
})
