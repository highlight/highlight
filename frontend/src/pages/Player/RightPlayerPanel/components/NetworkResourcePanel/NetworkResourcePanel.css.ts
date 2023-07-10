import { sprinkles } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

// Custom tab styles we had to override to get scrolling behavior to work. These
// should be removed once we upgrade our Tabs component:
// https://github.com/highlight/highlight/issues/5771
export const container = style({
	height: 'auto !important',
	overflowY: 'hidden',
})

export const pageContainer = sprinkles({
	overflowY: 'scroll',
	position: 'relative',
})
