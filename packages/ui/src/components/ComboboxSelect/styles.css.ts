import { style } from '@vanilla-extract/css'

import { vars } from '@/vars'

import { colors } from '../../css/colors'

export const selectLabel = style({
	display: 'none',
})

export const selectButton = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	border: vars.border.secondary,
	borderRadius: 20,
	color: vars.theme.static.content.moderate,
	display: 'flex',
	fontSize: 13,
	gap: 4,
	height: 20,
	padding: '0 6px',

	selectors: {
		'&:hover': {
			cursor: 'pointer',
			background: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const combobox = style({
	width: '100%',
	border: 'none',
	fontSize: '13px',
	fontWeight: '500 !important',
	selectors: {
		'&:focus-visible': {
			outline: 'none',
		},
		'&::placeholder': {
			color: vars.theme.interactive.fill.secondary.content.onDisabled,
		},
	},
})

export const comboboxWrapper = style({
	padding: '6px 8px',
	display: 'flex',
	gap: 4,
	alignItems: 'center',
})

export const comboboxHasResults = style({
	borderBottom: `1px solid ${vars.color.n7}`,
})

export const comboboxList = style({
	maxHeight: '380px',
	overflowY: 'auto',
})

export const selectPopover = style({
	backgroundColor: colors.white,
	border: vars.border.secondary,
	borderRadius: 6,
	minWidth: 150,
	zIndex: 10,
	maxWidth: '50vw',
	boxShadow: vars.shadows.medium,
})

export const selectItem = style({
	alignItems: 'center',
	display: 'flex',
	fontSize: 13,
	gap: 6,
	padding: '6px 8px',

	selectors: {
		'&[data-active-item]': {
			backgroundColor: vars.color.n5,
			color: vars.theme.static.content.default,
			cursor: 'pointer',
		},
	},
})

export const statePlaceholder = style({
	fontWeight: 500,
	color: vars.theme.static.content.moderate,
	justifyContent: 'center',
})

export const checkbox = style({
	border: vars.border.secondary,
	borderRadius: 4,
	display: 'flex',
	padding: 1,
	selectors: {
		[`${selectItem}[aria-selected="true"] &`]: {
			backgroundColor: vars.theme.interactive.fill.primary.enabled,
		},
		[`${selectItem}[aria-selected="false"] &`]: {
			backgroundColor: 'white',
		},
	},
})
