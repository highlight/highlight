import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
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
	gap: 8,
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
	border: 'none !important',
	borderRadius: 0,
	selectors: {
		'&:focus:enabled, &:active:enabled': {
			backgroundColor: colors.white,
			boxShadow: shadows.n5,
		},
		'&:hover:enabled': {
			backgroundColor: themeVars.interactive.overlay.secondary.hover,
		},
	},
	width: 28,
})

export const sessionSwitchButtonLeft = style({
	borderRadius: `6px 0px 0px 6px`,
})

export const sessionSwitchButtonRight = style({
	borderRadius: `0px 6px 6px 0px`,
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
