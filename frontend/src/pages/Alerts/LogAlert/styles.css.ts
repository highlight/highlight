import { vars } from '@highlight-run/ui'
import { sprinkles } from '@highlight-run/ui/src/css/sprinkles.css'
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

export const select = style({
	borderRadius: 6,
	border: vars.border.secondary,
	cursor: 'pointer',
	display: 'block',
	padding: '4px 6px',
	fontSize: 13,
	color: vars.theme.static.content.moderate,
	outline: 0,
	width: '100%',

	// For the dropdown indicator
	appearance: 'none',
	backgroundImage: `url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em" fill="none" viewBox="0 0 20 20" focusable="false" > <path fill="grey" fillRule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z" clipRule="evenodd" /> </svg>')`,
	backgroundRepeat: 'no-repeat',
	backgroundPosition: 'right 6px center',

	selectors: {
		'&::placeholder': {
			color: vars.theme.interactive.fill.secondary.content.onDisabled,
		},
		'&:disabled': {
			background: vars.color.n5,
		},
		'&:focus': {
			border: vars.border.secondaryPressed,
		},
	},
})

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
