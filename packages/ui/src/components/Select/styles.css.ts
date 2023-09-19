import { style } from '@vanilla-extract/css'
import { sprinkles } from 'css/sprinkles.css'

export const select = style({})

export const popover = sprinkles({
	background: 'white',
	borderRadius: '4',
	boxShadow: 'small',
	border: 'dividerWeak',
})

export const option = style({
	padding: '8px 12px',
	cursor: 'pointer',
	':hover': {
		background: '#F5F5F5',
	},
})
