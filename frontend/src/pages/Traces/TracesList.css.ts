import { borders } from '@highlight-run/ui/borders'
import { colors } from '@highlight-run/ui/colors'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const selectPopover = style({
	backgroundColor: colors.white,
	border: borders.secondary,
	borderRadius: 6,
	minWidth: 150,
	zIndex: 10,
	maxWidth: '50vw',
})

export const comboboxItem = style({
	alignItems: 'center',
	cursor: 'pointer',
	display: 'flex',
	fontSize: 13,
	gap: 4,
	padding: '12px 10px',

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
	borderRadius: 4,
	display: 'flex',
	padding: 1,
	selectors: {
		[`${comboboxItem}[aria-selected="true"] &`]: {
			backgroundColor: vars.theme.interactive.fill.primary.enabled,
		},
		[`${comboboxItem}[aria-selected="false"] &`]: {
			backgroundColor: 'white',
		},
	},
})
