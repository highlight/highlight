import { sprinkles } from '@highlight-run/ui/sprinkles'
import { style } from '@vanilla-extract/css'

export const panel = style([
	sprinkles({
		backgroundColor: 'white',
		display: 'flex',
		flexDirection: 'column',
		border: 'dividerWeak',
		boxShadow: 'small',
	}),
	{
		minWidth: 400,
		maxWidth: 1200,
		right: 0,
		top: 0,
		bottom: 0,
		zIndex: 30000,
		position: 'fixed',
	},
])
