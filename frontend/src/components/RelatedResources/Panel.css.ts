import { sprinkles } from '@highlight-run/ui/sprinkles'
import { vars } from '@highlight-run/ui/vars'
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

export const panelDragHandle = style({
	cursor: 'col-resize',
	position: 'absolute',
	left: -2,
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
