import { style } from '@vanilla-extract/css'
import { vars } from '@highlight-run/ui/vars'

export const chart = style({
	flex: '0 0 50%',
})

export const chartText = style({
	position: 'absolute',
})

export const metricsTable = style({
	width: '100%',
	tableLayout: 'fixed',
})

export const metricsTableContainer = style({
	display: 'grid',
	gridTemplateColumns: '50% 15% 10% 12% 13%',
	width: '100%',
	borderTop: `1px solid ${vars.theme.static.divider.weak}`,
})

export const metricsGridRow = style({
	display: 'contents',
})

export const truncatedCell = style({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	maxWidth: '100%',
	display: 'block',
})

export const tableCell = style({
	padding: vars.space[4],
	overflow: 'hidden',
	minWidth: 0, // Important for proper text truncation
	borderBottom: `1px solid ${vars.theme.static.divider.weak}`,
	':hover': {
		backgroundColor: vars.color.n2,
	},
})

export const headerCell = style({
	cursor: 'pointer',
	paddingLeft: vars.space[4],
	paddingRight: vars.space[4],
	paddingTop: vars.space[3],
	paddingBottom: vars.space[3],
	fontWeight: 'bold',
	borderBottom: `1px solid ${vars.theme.static.divider.weak}`,
	backgroundColor: vars.theme.static.surface.raised,
})

// These styles are kept for reference but no longer actively used with the <Table> component
export const nameColumn = style({
	width: '50%',
})

export const dateColumn = style({
	width: '15%',
})

export const pointsColumn = style({
	width: '10%',
})

export const typeColumn = style({
	width: '12%',
})

export const serviceColumn = style({
	width: '13%',
})
