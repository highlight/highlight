import { colors } from '@highlight-run/ui/src/css/colors'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const devToolsWindowV2 = style({
	alignItems: 'center',
	backgroundColor: colors.white,
	display: 'flex',
	flexDirection: 'column',
	zIndex: 5,
	position: 'relative',
})

export const controlBarButton = style({
	backgroundColor: 'white',
	boxShadow: 'none',
	color: colors.n11,
})

export const switchInverted = style({
	transform: 'rotate(90deg)',
})

export const autoScroll = style({
	height: 20,
})

export const pageWrapper = style({
	backgroundColor: colors.n1,
	borderTop: `1px solid ${colors.n6}`,
	width: '100%',
	height: '100%',
	paddingBottom: 8,
})

export const controlBarVariants = recipe({
	base: {
		background: 'none',
		borderRadius: 0,
		borderBottom: `none`,
		boxShadow: 'none',
		selectors: {
			'&:focus:enabled, &:active:enabled, &:hover:enabled': {
				background: 'none',
				boxShadow: 'none',
				borderRadius: 0,
				color: colors.n11,
			},
		},
	},
	variants: {
		selected: {
			true: {
				color: colors.p9,
			},
			false: {
				color: colors.n11,
			},
		},
	},

	defaultVariants: {
		selected: false,
	},
})

export const controlBarBottomVariants = recipe({
	base: {
		backgroundColor: colors.n11,
		borderRadius: '2px 2px 0px 0px',
		height: 2,
		transition: 'background-color 1s ease',
	},
	variants: {
		selected: {
			true: {
				backgroundColor: colors.p9,
			},
		},
		hovered: {
			true: {
				backgroundColor:
					themeVars.interactive.outline.secondary.enabled,
			},
		},
	},
	compoundVariants: [
		{
			variants: { hovered: true, selected: true },
			style: {
				backgroundColor: colors.p9,
			},
		},
	],
})
