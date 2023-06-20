import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

import { colors } from '../../css/colors'

const BORDER_RADIUS = 6

export const selectLabel = style({
	display: 'none',
})

export const selectButton = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	border: vars.border.secondary,
	borderRadius: BORDER_RADIUS,
	color: vars.theme.static.content.moderate,
	display: 'flex',
	fontSize: 13,
	gap: 4,
	padding: '0 8px',

	selectors: {
		'&:hover': {
			cursor: 'pointer',
			background: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const selectPopover = style({
	backgroundColor: colors.white,
	border: vars.border.secondary,
	borderRadius: BORDER_RADIUS,
	minWidth: 150,
	zIndex: 10,
})

export const selectItem = style({
	alignItems: 'center',
	display: 'flex',
	fontSize: 13,
	gap: 4,
	padding: '4px 8px',

	selectors: {
		'&[data-active-item]': {
			backgroundColor: vars.color.n5,
			color: vars.theme.static.content.default,
			cursor: 'pointer',
		},
	},
})

export const checkbox = style({
	border: vars.border.secondary,
	borderRadius: BORDER_RADIUS,
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
