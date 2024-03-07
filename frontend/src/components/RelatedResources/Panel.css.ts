import { sprinkles } from '@highlight-run/ui/sprinkles'
import { style } from '@vanilla-extract/css'

export const panel = style([
	sprinkles({
		backgroundColor: 'white',
		display: 'flex',
		flexDirection: 'column',
		borderLeft: 'dividerWeak',
		boxShadow: 'small',
	}),
	{
		minWidth: 400,
		maxWidth: 1200,
		right: 0,
		top: 0,
		bottom: 0,
		zIndex: 30000,
		position: 'fixed',
	},
])

export const backdrop = style({
	backgroundColor: 'rgba(0, 0, 0, 0.05)',
	transition: 'opacity 0.2s',
})

export const panelDragHandle = style({
	cursor: 'ew-resize',
	position: 'absolute',
	left: -2,
	top: 0,
	bottom: 0,
	width: 4,
})
