import { style } from '@vanilla-extract/css'

export const templateGrid = style({
	display: 'grid',
	width: '100%',
	height: '100%',
	gridTemplateColumns: '1fr 1fr 1fr',
})

export const templatePreview = style({
	width: '220px',
	height: '120px',
})
