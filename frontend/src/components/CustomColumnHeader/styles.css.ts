import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const panelDragHandle = style({
	cursor: 'col-resize',
	position: 'absolute',
	right: 0,
	top: 0,
	bottom: 0,
	transition: 'background-color 0.3s',
	width: 4,
	zIndex: 1,

	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.outline.primary.pressed,
		},
		'&:focus': {
			backgroundColor: vars.theme.interactive.outline.primary.pressed,
		},
	},
})
