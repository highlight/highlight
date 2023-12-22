import { style } from '@vanilla-extract/css'

export const modalSubTitle = style({
	color: 'var(--color-gray-500) !important',
	fontSize: 16,
	lineHeight: '1.5 !important',
	marginTop: '0 !important',
})

export const actionsContainer = style({
	columnGap: 'var(--size-medium)',
	display: 'flex',
	paddingTop: 'var(--size-medium)',
})

export const actionButton = style({
	flexGrow: 1,
	justifyContent: 'center',
})
