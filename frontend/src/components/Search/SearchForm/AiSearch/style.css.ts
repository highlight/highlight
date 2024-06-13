import { typographyStyles } from '@highlight-run/ui/components'
import { sprinkles } from '@highlight-run/ui/sprinkles'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

import { styledVerticalScrollbar } from '@/style/common.css'

export const container = style({
	position: 'relative',
	zIndex: 1,

	selectors: {
		'&:after': {
			background:
				'linear-gradient(45deg, rgba(162, 138, 220) 0%, rgba(216, 165, 216) 50%, rgba(233, 192, 186) 100%)',
			border: '2px solid transparent',
			content: '',
			borderRadius: 5,
			inset: 0,
			mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
			maskComposite: 'exclude',
			position: 'absolute',
			zIndex: -1,
		},
	},
})

export const containerError = style({
	selectors: {
		'&:after': {
			background: vars.theme.interactive.fill.bad.enabled,
		},
	},
})

export const searchIcon = style({
	position: 'absolute',
	top: 12,
	left: 14,
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

export const comboboxError = style({
	color: vars.theme.interactive.fill.bad.enabled,
})

export const comboboxWithTags = style({
	color: 'transparent',
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

export const comboboxResults = style([styledVerticalScrollbar])

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

export const comboboxTagsContainer = style([
	typographyStyles.family.monospace,
	typographyStyles.size.small,
	{
		display: 'block',
		fontWeight: '500 !important',
		maxWidth: '100%',
		paddingBottom: 12,
		paddingRight: 6,
		paddingTop: 12,
		pointerEvents: 'none',
		position: 'absolute',
		whiteSpace: 'pre-wrap',
	},
])
