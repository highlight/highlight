import { vars } from '@highlight-run/ui'
import { sprinkles } from '@highlight-run/ui/src/css/sprinkles.css'
import { style } from '@vanilla-extract/css'

export const combobox = style([
	sprinkles({
		py: '6',
	}),
	{
		background: 'transparent',
		border: 0,
		color: vars.theme.static.content.default,
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

export const container = style({
	background: vars.theme.static.surface.nested,
	width: '100%',
	height: '100%',
})

export const header = style({
	display: 'grid',
	gridTemplateColumns: '100px 80px 80px',
	gridGap: 6,
	borderBottom: `1px solid ${vars.theme.interactive.fill.secondary.pressed}`,
	padding: '12px 14px 10px',
})

export const resultsContainer = style({
	width: '100%',
	height: 'calc(100% - 32px)',
	display: 'flex',
	flexDirection: 'column',
	paddingLeft: 8,
	overflowX: 'hidden',
	overflowY: 'auto',
	wordWrap: 'break-word',
})

export const nameSection = style({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	paddingRight: 24,
})
