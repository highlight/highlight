import { sprinkles } from '@highlight-run/ui/sprinkles'
import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

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
	color: `${vars.theme.static.content.default} !important`,
	selectors: {
		'&:hover': {
			background: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

globalStyle(`${selectContainer} .ant-select-selector`, {
	padding: `0 6px !important`,
	borderRadius: `6px !important`,
	border: `${vars.border.secondary} !important`,
	boxShadow: 'none !important',
})

globalStyle(`${selectContainer} .ant-select-selector:hover`, {
	background: `${vars.theme.interactive.overlay.secondary.hover} !important`,
})

globalStyle(`${selectContainer} .ant-select-selection-item`, {
	display: 'flex',
	alignItems: 'center',
})
