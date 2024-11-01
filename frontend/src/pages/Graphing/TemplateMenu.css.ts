import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const templateGrid = style({
	display: 'grid',
	width: '100%',
	height: '100%',
	gridTemplateColumns: '1fr 1fr 1fr',
})

export const templatePreview = style({
	width: '100%',
	height: '120px',
	borderRadius: 4,
	cursor: 'pointer',
	border: 'none',
	selectors: {
		'&:hover': {
			border: `1px solid ${vars.theme.static.divider.default}`,
		},
	},
})

export const templateTitle = style({
	color: vars.theme.static.content.default,
})

export const templateDescription = style({
	color: vars.theme.static.content.weak,
})
