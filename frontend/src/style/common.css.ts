import { borders } from '@highlight-run/ui/borders'
import { themeVars } from '@highlight-run/ui/theme'
import { style } from '@vanilla-extract/css'

export const SCROLLBAR_SIZE = 9

const scrollbarThumbCoreStyles = {
	backgroundClip: 'padding-box',
	backgroundColor: themeVars.interactive.outline.secondary.enabled,
	border: '1px solid transparent',
	borderRadius: 30,
} as const

const scrollbarCommonStyles = {
	'&::-webkit-scrollbar': {
		width: SCROLLBAR_SIZE,
		height: SCROLLBAR_SIZE,
	},
	':hover&::-webkit-scrollbar-thumb': {
		backgroundColor: themeVars.interactive.outline.secondary.hover,
	},
} as const

export const styledHorizontalScrollbar = style({
	selectors: {
		...scrollbarCommonStyles,
		':hover&::-webkit-scrollbar': {
			borderTop: borders.dividerWeak,
		},
		'&::-webkit-scrollbar-thumb': {
			...scrollbarThumbCoreStyles,
			borderTopWidth: 2,
		},
	},
})

export const styledVerticalScrollbar = style({
	selectors: {
		...scrollbarCommonStyles,
		':hover&::-webkit-scrollbar': {
			borderLeft: borders.dividerWeak,
		},
		'&::-webkit-scrollbar-thumb': {
			...scrollbarThumbCoreStyles,
			borderLeftWidth: 2,
		},
	},
})
