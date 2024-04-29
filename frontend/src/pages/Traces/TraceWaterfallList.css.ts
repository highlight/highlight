import { themeVars } from '@highlight-run/ui/theme'
import { style } from '@vanilla-extract/css'

export const dragHandle = style({
	backgroundColor: 'transparent',
	cursor: 'ew-resize',
	position: 'absolute',
	transition: 'background-color 0.3s',
	height: '100%',
	top: 0,
	bottom: 0,
	right: -2,
	width: 4,
	zIndex: 1,
	selectors: {
		'&:hover': {
			backgroundColor: themeVars.static.divider.strong,
		},
	},
})

export const highlightedText = style({
	position: 'relative',
	'::after': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: themeVars.static.surface.sentiment.caution,
		borderRadius: 4,
		color: 'inherit !important',
		display: 'inline-block',
		padding: '0 4px',
	},
})
