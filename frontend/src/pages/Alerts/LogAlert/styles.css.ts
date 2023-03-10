import { vars } from '@highlight-run/ui'
import { sprinkles } from '@highlight-run/ui/src/css/sprinkles.css'
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
	{},
	sprinkles({
		borderRadius: '6',
		border: 'secondary',
		pr: '4',
	}),
])
export const combobox = style([
	sprinkles({
		py: '4',
		pl: '6',
	}),
	{
		border: 0,
		background: 'transparent',
		color: vars.theme.static.content.default,
		display: 'flex',
		fontSize: 13,
		width: '100%',
		selectors: {
			'&:focus': {
				outline: 0,
			},
			'&::placeholder': {
				color: vars.theme.interactive.fill.secondary.content.onDisabled,
			},
		},
	},
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
