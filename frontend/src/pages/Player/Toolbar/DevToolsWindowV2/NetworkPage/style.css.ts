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
	height: 'calc(100% - 32px)',
	display: 'flex',
	flexDirection: 'column',
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
	height: '100%',
})

export const timingBarEmptySection = style({
	backgroundColor: colors.n6,
})

export const timingBar = style({
	backgroundColor: colors.p10,
	borderRadius: 4,
	height: '60%',
})

const gridTemplateColumns = '80px 80px 1fr 100px 80px 80px 20px'
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
		display: 'grid',
		gridTemplateColumns,
		gridGap,
		padding: 6,
		color: vars.theme.interactive.fill.secondary.content.onEnabled,
		width: '100%',
		height: 36,
		alignItems: 'center',
		selectors: {
			'&:hover': {
				backgroundColor: vars.theme.interactive.overlay.secondary.hover,
			},
		},
	},
	variants: {
		current: {
			true: {
				borderBottom: `2px solid ${vars.theme.interactive.fill.primary.enabled}`,
			},
			false: {},
		},
		failedResource: {
			true: {
				color: vars.theme.interactive.fill.bad.content.text,
			},
			false: {},
		},
		showingDetails: {
			true: {
				fontWeight: '500',
			},
			false: {},
		},
	},
})
