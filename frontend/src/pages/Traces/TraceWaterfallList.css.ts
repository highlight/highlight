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
