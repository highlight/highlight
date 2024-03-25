import { sprinkles } from '@highlight-run/ui/sprinkles'
import { style } from '@vanilla-extract/css'

export const dialog = style([
	sprinkles({
		backgroundColor: 'white',
		display: 'flex',
		flexDirection: 'column',
		border: 'dividerWeak',
		borderRadius: '6',
		boxShadow: 'small',
		overflow: 'hidden',
	}),
	{
		width: '50%',
		minWidth: 600,
		right: 8,
		top: 8,
		bottom: 8,
		zIndex: 8,
		position: 'absolute',
	},
])
