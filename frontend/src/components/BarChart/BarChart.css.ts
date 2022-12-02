import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const barDiv = style({
	display: 'flex',
	flexDirection: 'column',
	flexGrow: 1,
	justifyContent: 'flex-end',
})

export const bar = style({
	backgroundColor: colors.neutralN9,
	borderRadius: 4,
	height: 0,
	width: '100%',
})

export const barSelected = style({
	backgroundColor: colors.purpleP9,
})

export const barChartWrapper = style({
	alignItems: 'flex-end',
	display: 'flex',
	justifyContent: 'flex-end',
})
