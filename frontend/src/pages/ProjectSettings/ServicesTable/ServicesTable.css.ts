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
