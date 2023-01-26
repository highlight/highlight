import { borders } from '@highlight-run/ui/src/css/borders'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'

export const SCROLLBAR_SIZE = 9

export const styledScrollbar = style({
	selectors: {
		'&::-webkit-scrollbar': {
			width: SCROLLBAR_SIZE,
			height: SCROLLBAR_SIZE,
		},
		':hover&::-webkit-scrollbar': {
			borderLeft: borders.dividerWeak,
		},
		'&::-webkit-scrollbar-thumb': {
			backgroundClip: 'padding-box',
			backgroundColor: themeVars.interactive.outline.secondary.enabled,
			border: '1px solid transparent',
			borderLeftWidth: 2,
			borderRadius: 30,
		},
		':hover&::-webkit-scrollbar-thumb': {
			backgroundColor: themeVars.interactive.outline.secondary.hover,
		},
	},
})
