import { sMonotype, typographyStyles } from '@highlight-run/ui/components'
import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const searchIcon = style({
	position: 'absolute',
	top: 13,
	left: 14,
})

export const combobox = style([
	sprinkles({
		p: '6',
	}),
	typographyStyles.family.monospace,
	{
		...sMonotype,
		background: 'transparent',
		border: 0,
		caretColor: vars.theme.static.content.default,
		display: 'flex',
		pointerEvents: 'auto',
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

export const comboboxTagsContainer = style([
	typographyStyles.family.monospace,
	sMonotype,
	{
		alignItems: 'center',
		display: 'flex',
		flexWrap: 'nowrap',
		maxWidth: 'calc(100% - 26px)',
		overflow: 'hidden',
		pointerEvents: 'none',
		position: 'absolute',
	},
])

export const comboboxTag = style({
	color: 'transparent',
	display: 'inline-flex',
	fontFeatureSettings: 'normal', // disable tabular numbers
	position: 'relative',
	textOverflow: 'ellipsis',
})

export const comboboxTagBackground = style({
	backgroundColor: `rgba(0, 0, 0, 0.1)`,
	borderRadius: vars.borderRadius[4],
	height: 20,
	letterSpacing: 'normal',
	position: 'absolute',
	top: 7,
	left: -2,
	bottom: 0,
	right: -2,
	width: 'calc(100% + 4px)',
})

export const comboboxTagClose = style({
	color: themeVars.static.content.default,
	cursor: 'pointer',
	position: 'absolute',
	pointerEvents: 'auto',
	opacity: 0,
	right: -8,
	top: 1,
	zIndex: 1,
	selectors: {
		'&:hover': {
			opacity: 1,
		},
	},
})

export const comboboxPopover = style({
	background: vars.theme.static.surface.default,
	border: vars.border.dividerWeak,
	borderRadius: vars.borderRadius[8],
	boxShadow: vars.shadows.small,
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	maxWidth: 600,
	maxHeight: 'min(var(--popover-available-height,300px),300px)',
	zIndex: 10,
})

export const comboboxItem = style({
	cursor: 'pointer',
	padding: '12px 10px',
	selectors: {
		'&:hover': {
			backgroundColor: vars.theme.interactive.fill.secondary.hover,
		},
		'&[data-active-item]': {
			backgroundColor: vars.theme.interactive.fill.secondary.pressed,
		},
	},
})

export const comboboxGroup = style([
	sprinkles({
		overflowY: 'scroll',
		overflowX: 'hidden',
	}),
	styledVerticalScrollbar,
	{
		selectors: {
			'& + &': {
				borderTop: vars.border.secondary,
			},
		},
	},
])
