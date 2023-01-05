import { style } from '@vanilla-extract/css'

export const collapsibleContent = style({
	margin: 0,
	maxHeight: 'calc(100vh - 540px)',
	overflow: 'scroll',
})

export const metadataPanel = style({
	display: 'flex',
	flexDirection: 'column',
	rowGap: 4,
})
