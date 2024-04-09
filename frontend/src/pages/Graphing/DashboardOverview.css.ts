import { style } from '@vanilla-extract/css'

export const emptyContainer = style({
	cursor: 'auto',
	display: 'flex',
	flexDirection: 'column',
	margin: '0 auto',
	maxWidth: '400px',
	paddingBottom: '32px',
	paddingTop: '32px',
})

export const searchInputWrapper = style({
	borderBottomLeftRadius: 0,
	borderBottomRightRadius: 0,
})

export const searchInput = style({
	border: 'none',
	selectors: {
		'&:hover': {
			border: 'none',
		},
	},
})
