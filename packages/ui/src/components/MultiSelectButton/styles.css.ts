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
})

export const selectPopover = style({
	backgroundColor: colors.white,
	border: vars.border.secondary,
	borderRadius: BORDER_RADIUS,
	zIndex: 10,
})

export const selectItem = style({
	alignItems: 'center',
	display: 'flex',
	fontSize: 13,
	gap: 16,
	justifyContent: 'space-between',
	padding: '4px 8px',

	selectors: {
		'&[aria-selected="true"]': {
			color: vars.color.white,
			backgroundColor: vars.theme.interactive.fill.primary.enabled,
		},
		'&[data-active-item]': {
			backgroundColor: vars.color.n5,
			color: vars.theme.static.content.default,
			cursor: 'pointer',
		},
		'&:first-of-type': {
			borderTopLeftRadius: BORDER_RADIUS,
			borderTopRightRadius: BORDER_RADIUS,
		},
		'&:last-of-type': {
			borderBottomLeftRadius: BORDER_RADIUS,
			borderBottomRightRadius: BORDER_RADIUS,
		},
	},
})
