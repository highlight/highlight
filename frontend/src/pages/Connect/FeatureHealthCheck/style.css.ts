import { style } from '@vanilla-extract/css'

export const featureGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
	gap: '10px',
})
