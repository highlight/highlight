import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import { style } from '@vanilla-extract/css'

export const sessionLevelBarV2 = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	display: 'flex',
	height: 44,
})

export const invertedCaret = style({
	transform: 'rotate(180deg)',
	height: 14,
	color: colors.n11,
})

export const caret = style({
	height: 14,
	paddingRight: 8,
	color: colors.n11,
})

export const verticalBar = style({
	borderLeft: `1px solid ${colors.n6}`,
	height: 16,
})

export const currentUrl = style({
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflowX: 'hidden',
	display: 'inline-block',
})

export const leftButtons = style({
	display: 'flex',
	alignItems: 'center',
	overflowX: 'hidden',
})

export const rightButtons = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	gap: 16,
	minWidth: 400,
})

export const openLeftPanelButton = style({
	minWidth: 30,
	marginRight: 8,
})

export const sessionSwitchButton = style({
	border: '0 !important',
	borderRadius: 0,
})

export const rightPanelButtonShown = style({
	selectors: {
		'&:focus:enabled, &:active:enabled': {
			background: colors.n5,
			boxShadow: shadows.grey,
		},
	},
})

export const rightPanelButtonHidden = style({
	selectors: {
		'&:focus:enabled, &:active:enabled': {
			background: 'transparent',
			color: colors.n11,
		},
	},
})
