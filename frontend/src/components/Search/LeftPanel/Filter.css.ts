import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const checkbox = style({
	border: vars.border.secondary,
	borderRadius: 4,
	display: 'flex',
	padding: 1,
})

export const filterButton = style({
	justifyContent: 'space-between',
})

const POPOVER_WIDTH = 300

export const selectButton = style({
	borderRadius: 4,
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
