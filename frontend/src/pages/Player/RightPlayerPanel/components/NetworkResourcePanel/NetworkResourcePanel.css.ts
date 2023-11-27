import { sprinkles } from '@highlight-run/ui/sprinkles'
import { style } from '@vanilla-extract/css'

// Custom tab styles we had to override to get scrolling behavior to work. These
// should be removed once we upgrade our Tabs component:
// https://github.com/highlight/highlight/issues/5771
export const container = style({
	height: '100%',
	overflowY: 'hidden',
})

export const tabsContainer = sprinkles({
	borderBottom: 'secondary',
})

export const pageContainer = sprinkles({
	height: 'full',
	overflowY: 'scroll',
	position: 'relative',
})
