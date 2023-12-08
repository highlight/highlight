import { colors } from '@highlight-run/ui/colors'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const container = style({
	background: colors.n1,
	width: '100%',
	height: '100%',
})

export const networkBox = style({
	width: '100%',
	height: 'calc(100% - 22px)',
	display: 'flex',
	flexDirection: 'column',
	overflowX: 'hidden',
	overflowY: 'auto',
	wordWrap: 'break-word',
})

const gridTemplateColumns = '20px 1fr 80px 120px'
const gridGap = 0

export const websocketHeader = style({
	display: 'grid',
	gridTemplateColumns,
	gridGap,
	borderBottom: `1px solid ${colors.n6}`,
	paddingRight: '4px',
	height: 22,
})

export const websocketRowVariants = recipe({
	base: {
		display: 'grid',
		gridTemplateColumns,
		gridGap,
		color: vars.theme.interactive.fill.secondary.content.onEnabled,
		width: '100%',
		height: 24,
		alignItems: 'center',
		selectors: {},
	},
})
