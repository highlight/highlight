import { sprinkles } from '@highlight-run/ui/src/css/sprinkles.css'
import { style } from '@vanilla-extract/css'

const DIALOG_Z_INDEX = 99999

export const dialog = style({
	zIndex: DIALOG_Z_INDEX,
	height: '100vh',
	width: '100vw',
	display: 'flex',
	justifyContent: 'center',
	position: 'fixed',
	top: 0,
	left: 0,
})

export const dialogBackdrop = style({
	backgroundColor: 'rgba(111, 110, 119, 0.48)',
	zIndex: DIALOG_Z_INDEX,
})

export const container = style({
	width: 580,
	top: '25vh',
})

export const form = style({
	width: '100%',
})

export const datePicker = style({
	flexShrink: 0,
})

export const searchIcon = style({ flexShrink: 0 })

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
