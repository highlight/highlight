import { colors } from '@highlight-run/ui/colors'
import { style } from '@vanilla-extract/css'

export const barDiv = style({
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	justifyContent: 'flex-end',
})

export const bar = style({
	backgroundColor: colors.n9,
	borderRadius: 4,
	height: 0,
	width: '100%',
})

export const barSelected = style({
	backgroundColor: colors.p9,
})

export const barChartWrapper = style({
	alignItems: 'flex-end',
	display: 'flex',
	justifyContent: 'flex-end',
})
