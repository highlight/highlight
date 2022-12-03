import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const container = style({
	width: '100%',
	height: '100%',
})

export const containerPadding = style({
	padding: 8,
})

export const networkBox = style({
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	padding: '0 8px',
	overflowX: 'hidden',
	overflowY: 'auto',
	wordWrap: 'break-word',
})

export const noDataContainer = style({
	alignSelf: 'center',
	padding: '32px 64px',
	textAlign: 'center',
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
	backgroundColor: colors.neutralN6,
})

export const timingBar = style({
	backgroundColor: colors.purple500,
	borderRadius: 4,
	height: '60%',
})

const gridTemplateColumns = '80px 80px 1fr 120px 160px'
const gridGap = 6

export const networkHeader = style({
	display: 'grid',
	gridTemplateColumns,
	gridGap,
	borderBottom: `1px solid ${colors.neutralN6}`,
	padding: '12px 12px 8px',
})

export const networkRowVariants = recipe({
	base: {
		backgroundColor: colors.white,
		display: 'grid',
		gridTemplateColumns,
		gridGap,
		padding: 6,
		width: '100%',
		height: 36,
		borderRadius: 6,
		borderBottom: `1px solid ${colors.neutralN6}`,
		selectors: {
			'&:hover': {
				backgroundColor: colors.neutralN4,
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
