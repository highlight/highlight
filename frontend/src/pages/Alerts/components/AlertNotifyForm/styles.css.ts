import { sprinkles } from '@highlight-run/ui/sprinkles'
import { style } from '@vanilla-extract/css'

export const sectionHeader = style([
	sprinkles({
		display: 'flex',
		alignItems: 'center',
		gap: '8',
		width: 'full',
	}),
	{
		height: 20,
	},
])

export const selectContainer = style({
	width: '100%',
})
