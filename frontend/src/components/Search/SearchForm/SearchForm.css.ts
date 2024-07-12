import { typographyStyles } from '@highlight-run/ui/components'
import { sprinkles } from '@highlight-run/ui/sprinkles'
import { themeVars } from '@highlight-run/ui/theme'
import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const searchIcon = style({
	position: 'absolute',
	top: 10,
	left: 14,
	color: vars.theme.interactive.fill.secondary.content.text,
})

export const searchIconWithActions = style({
	top: 12,
})

export const combobox = style([
	sprinkles({
		p: '6',
	}),
	typographyStyles.family.monospace,
	typographyStyles.size.small,
	{
		background: 'transparent',
		border: 0,
		caretColor: vars.theme.static.content.default,
		display: 'flex',
		fontFeatureSettings: '"tnum" off', // disable tabular numbers
		fontWeight: '500 !important',
		pointerEvents: 'auto',
		width: '100%',
		selectors: {
			'&:focus': {
				outline: 0,
			},
			'&::placeholder': {
				color: vars.theme.interactive.fill.secondary.content.onDisabled,
			},
			'&::selection': {
				backgroundColor: vars.theme.interactive.fill.secondary.pressed,
			},
		},
	},
])

export const comboboxNotEmpty = style({
	WebkitTextFillColor: 'transparent',
})

export const comboboxTagsContainer = style([
	typographyStyles.family.monospace,
	typographyStyles.size.small,
	{
		display: 'block',
		fontWeight: '500 !important',
		maxWidth: 'calc(100% - 24px)',
		paddingBottom: 12,
		paddingRight: 14,
		paddingTop: 12,
		pointerEvents: 'none',
		position: 'absolute',
		whiteSpace: 'pre-wrap',
	},
])

export const comboboxTag = style({
	boxShadow: `0 0 0 1px ${vars.theme.static.divider.weak}`,
	borderRadius: vars.borderRadius[4],
	display: 'inline',
	fontFeatureSettings: '"tnum" off', // disable tabular numbers
	position: 'relative',
	whiteSpace: 'pre-wrap',
	height: 20,
})

export const token = style([
	typographyStyles.family.monospace,
	{
		height: 20,
	},
])

export const errorToken = style({
	backgroundColor: 'rgba(255, 9, 87, 0.1)',
})

export const comboboxTagActive = style({})
export const comboboxTagError = style({})

export const comboboxTagClose = style({
	backgroundColor: vars.color.white,
	borderRadius: vars.borderRadius.round,
	bottom: 8,
	color: themeVars.static.content.default,
	cursor: 'pointer',
	marginLeft: -6,
	position: 'absolute',
	pointerEvents: 'auto',
	opacity: 0,
	zIndex: 1,
})

export const comboboxTagErrorIndicator = style({
	backgroundColor: vars.color.white,
	borderRadius: vars.borderRadius.round,
	bottom: 8,
	color: themeVars.static.content.sentiment.bad,
	fontWeight: 'bold',
	marginLeft: -6,
	opacity: 1,
	position: 'absolute',
	pointerEvents: 'auto',
	zIndex: 1,
})

globalStyle(`${comboboxTagActive}${comboboxTag}`, {
	backgroundColor: `color-mix(in srgb, ${vars.theme.static.surface.elevated} 50%, transparent)`,
})

globalStyle(`${comboboxTagError}${comboboxTag}`, {
	boxShadow: `0 0 0 1px  ${vars.theme.static.content.sentiment.bad}`,
})

globalStyle(`${comboboxTag}:hover ${comboboxTagClose}`, {
	opacity: 1,
})

globalStyle(`${comboboxTag}:hover ${comboboxTagErrorIndicator}`, {
	display: 'none',
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
	minWidth: 'min(var(--popover-available-width,350px),350px)',
	paddingBottom: 33,
	zIndex: 10,
})

export const comboboxResults = style([
	styledVerticalScrollbar,
	{
		overflowY: 'scroll',
	},
])

export const comboboxItem = style({
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	flexDirection: 'row',
	padding: '0 10px',
	minHeight: 30,
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
		py: '4',
	}),
	{
		selectors: {
			'& + &': {
				borderTop: vars.border.secondary,
			},
		},
	},
])

export const toggle = style({
	paddingLeft: '8px',
})
