import { vars } from '@highlight-run/ui'
import { small } from '@highlight-run/ui/src/components/Text/styles.css'
import { sprinkles } from '@highlight-run/ui/src/css/sprinkles.css'
import { globalStyle, style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const searchIcon = style({
	position: 'absolute',
	top: 13,
	left: 14,
})

export const combobox = style([
	sprinkles({
		py: '6',
	}),
	{
		background: 'transparent',
		border: 0,
		caretColor: vars.theme.static.content.default,
		color: 'transparent', // hide text - shown in tags
		display: 'flex',
		fontSize: 13,
		width: '100%',
		selectors: {
			'&:focus': {
				outline: 0,
			},
		},
	},
])

globalStyle(`${combobox}::selection`, {
	backgroundColor: `rgba(0, 0, 0, 0.3)`,
})

export const comboboxTag = style({
	...small,
	alignItems: 'center',
	display: 'inline-flex',
	position: 'relative',
	selectors: {
		'&:after': {
			backgroundColor: `rgba(0, 0, 0, 0.05)`,
			border: vars.border.dividerWeak,
			borderRadius: vars.borderRadius[4],
			content: ' ',
			cursor: 'pointer',
			fontFeatureSettings: 'normal', // disable tabular numbers
			height: 20,
			letterSpacing: 'normal',
			position: 'absolute',
			top: 'calc(50% - 4px)',
			left: -1,
			bottom: 0,
			right: -1,
			width: 'calc(100% + 2px)',
		},
		'&:hover:after': {
			backgroundColor: `rgba(0, 0, 0, 0.1)`,
		},
	},
})

export const comboboxTagClose = style({
	cursor: 'pointer',
	display: 'none',
	position: 'absolute',
	right: -7,
	top: 2,
	zIndex: 1,
	selectors: {
		[`${comboboxTag}:hover &`]: {
			display: 'block',
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
	zIndex: 1,
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
