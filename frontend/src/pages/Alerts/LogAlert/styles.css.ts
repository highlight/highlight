import { sprinkles } from '@highlight-run/ui/sprinkles'
import { style } from '@vanilla-extract/css'

export const header = style({
	height: 40,
})

export const grid = style({
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gridTemplateRows: 'auto auto',
	gridColumnGap: 40,
	gridRowGap: 40,
})

export const queryContainer = style([
	sprinkles({
		borderRadius: '6',
		border: 'secondary',
		pr: '4',
	}),
])

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

export const thresholdTypeButton = style([
	sprinkles({
		px: '4',
		py: '2',
	}),
	{
		height: 20,
	},
])

export const selectContainer = style({
	width: '100%',
})
