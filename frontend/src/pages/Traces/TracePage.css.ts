import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'

export const container = style({})

export const hoveredSpan = style({})

export const span = style({
	backgroundColor: themeVars.interactive.outline.primary.enabled,
	color: themeVars.static.content.sentiment.informative,
	cursor: 'default',
	selectors: {
		[`${hoveredSpan}.&`]: {
			backgroundColor: themeVars.interactive.outline.primary.hover,
		},
	},
})

export const selectedSpan = style({
	backgroundColor: themeVars.interactive.fill.primary.enabled,
	color: 'white',
	selectors: {
		[`${span}.${hoveredSpan}.&`]: {
			backgroundColor: themeVars.interactive.fill.primary.pressed,
		},
	},
})
