import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const container = style({
	background: colors.n1,
	width: '100%',
	height: '100%',
})

export const networkBox = style({
	width: '100%',
	height: 'calc(100% - 32px)',
	display: 'flex',
	flexDirection: 'column',
	padding: '0 8px',
	overflowX: 'hidden',
	overflowY: 'auto',
	wordWrap: 'break-word',
})

export const nameSection = style({
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	paddingRight: 24,
})

export const timingBarWrapper = style({
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'center',
})

export const timingBarEmptySection = style({
	backgroundColor: colors.n6,
})

export const timingBar = style({
	backgroundColor: colors.p10,
	borderRadius: 4,
	height: '60%',
})

const gridTemplateColumns = '80px 80px 1fr 120px 160px'
const gridGap = 6

export const networkHeader = style({
	display: 'grid',
	gridTemplateColumns,
	gridGap,
	borderBottom: `1px solid ${colors.n6}`,
	padding: '12px 14px 10px',
})

export const networkRowVariants = recipe({
	base: {
		backgroundColor: colors.n1,
		color: colors.n11,
		display: 'grid',
		gridTemplateColumns,
		gridGap,
		padding: 6,
		width: '100%',
		height: 36,
		borderBottom: `1px solid ${colors.n6}`,
		selectors: {
			'&:hover': {
				backgroundColor: colors.n4,
			},
		},
	},
	variants: {
		current: {
			true: {},
			false: {},
		},
		failedResource: {
			true: {},
			false: {},
		},
		showingDetails: {
			true: {},
			false: {},
		},
	},
})
