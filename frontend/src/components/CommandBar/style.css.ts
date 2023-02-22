import { sprinkles } from '@highlight-run/ui/src/css/sprinkles.css'
import { style } from '@vanilla-extract/css'

export const dialog = style({
	zIndex: 99999,
	backgroundColor: 'rgba(111, 110, 119, 0.48)',
	height: '100vh',
	width: '100vw',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
})

export const container = style({
	width: 580,
})

export const form = style({
	width: '100%',
})

export const datePicker = style({
	flexShrink: 0,
})

export const searchIcon = style({ flexShrink: 0 })

export const content = style({})

export const flatRight = style({
	borderTopRightRadius: 0,
	borderBottomRightRadius: 0,
})

export const flatLeft = style({
	borderTopLeftRadius: 0,
	borderBottomLeftRadius: 0,
})

export const query = style({
	flex: 1,
})

export const row = style({
	selectors: {
		'&:hover': {
			cursor: 'pointer',
		},
	},
})

export const rowSelected = style([
	sprinkles({
		background: 'secondaryHover',
	}),
])
