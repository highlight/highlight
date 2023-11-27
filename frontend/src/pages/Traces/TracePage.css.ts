import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { style } from '@vanilla-extract/css'

export const container = style({})

export const hoveredSpan = style({})

export const span = style({
	backgroundColor: themeVars.interactive.outline.primary.enabled,
	border: `1px solid transparent`,
	color: themeVars.static.content.sentiment.informative,
	cursor: 'default',
	selectors: {
		[`${hoveredSpan}.&`]: {
			backgroundColor: themeVars.interactive.outline.primary.hover,
		},
	},
})

export const errorSpan = style({
	border: `1px solid ${themeVars.static.content.sentiment.bad}`,
	borderLeft: `4px solid ${themeVars.static.content.sentiment.bad}`,
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

// Custom tab styles we had to override to get scrolling behavior to work. These
// should be removed once we upgrade our Tabs component:
// https://github.com/highlight/highlight/issues/5771
export const tabs = style({
	height: '100%',
	overflowY: 'hidden',
})

export const tabsContainer = sprinkles({
	borderBottom: 'secondary',
	px: '20',
})

export const tabsPageContainer = sprinkles({
	height: 'full',
	overflowY: 'scroll',
	position: 'relative',
})
