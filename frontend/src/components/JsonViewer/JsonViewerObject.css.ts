import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const line = style({
	selectors: {
		'& &': {
			paddingLeft: 22,
		},
	},
})

export const attributeLine = style({})

export const attributeActions = style({
	alignItems: 'center',
	display: 'flex',
	visibility: 'hidden',
	flexDirection: 'row',
	gap: 4,
	opacity: 0.5,
	selectors: {
		'&:hover': {
			opacity: 1,
		},
		[`${attributeLine}:hover &`]: {
			visibility: 'visible',
		},
	},
})

export const attributeAction = style({
	opacity: 0.6,
	selectors: {
		'&:hover': {
			opacity: 1,
		},
	},
})

export const buttonLink = style({
	background: 'transparent',
	border: 0,
	cursor: 'pointer',
	padding: 0,
	color: vars.theme.interactive.fill.secondary.content.text,
	selectors: {
		'&:hover': {
			color: vars.theme.interactive.fill.secondary.content.onEnabled,
		},
		'&:active': {
			color: vars.theme.interactive.fill.secondary.content.onEnabled,
		},
	},
})
