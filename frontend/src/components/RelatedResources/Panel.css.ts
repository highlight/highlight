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
		transition: 'transform 0.2s',
		transform: 'translateX(100%)',
		willChange: 'transform',
		selectors: {
			'&[data-enter]': {
				transform: 'translateX(0)',
			},
			'&[data-leave]': {},
		},
	},
])

export const backdrop = style({
	backgroundColor: 'rgba(0, 0, 0, 0.05)',
	opacity: 0,
	transition: 'opacity 0.2s',
	selectors: {
		'&[data-enter]': {
			opacity: 1,
		},
		'&[data-leave]': {
			opacity: 0,
		},
	},
})

export const panelDragHandle = style({
	cursor: 'col-resize',
	position: 'absolute',
	left: -2,
	top: 0,
	bottom: 0,
	width: 4,
})
