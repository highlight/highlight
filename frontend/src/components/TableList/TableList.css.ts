import { vars } from '@highlight-run/ui/src'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const sessionAttributeRow = recipe({
	base: {
		alignItems: 'center',
		display: 'grid',
		gridTemplateColumns: `100px 175px`,
		gridGap: 8,
	},
	variants: {
		json: {
			false: {},
			true: { display: 'block' },
		},
	},
})

export const sessionAttributeText = style({
	alignItems: 'center',
	color: vars.theme.static.content.weak,
	height: 16,
	paddingTop: 4,
	paddingBottom: 4,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
})

export const secondaryText = style({
	color: vars.theme.interactive.fill.secondary.content.text,
	borderRadius: 8,
	paddingLeft: 4,
	paddingRight: 4,
	selectors: {
		'&:hover': {
			background: vars.theme.interactive.overlay.secondary.hover,
		},
	},
})

export const infoTooltip = style({
	position: 'relative',
	top: -4,
})
