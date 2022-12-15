import { colors } from '@highlight-run/ui/src/css/colors'
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
	color: colors.neutralN11,
})

export const switchInverted = style({
	transform: 'rotate(90deg)',
})

export const autoScroll = style({
	height: 20,
})

export const pageWrapper = style({
	backgroundColor: colors.neutralN1,
	width: '100%',
	height: '100%',
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
				color: colors.neutralN11,
			},
		},
	},
	variants: {
		selected: {
			true: {
				color: colors.purpleP9,
			},
			false: {
				color: colors.neutralN11,
			},
		},
	},

	defaultVariants: {
		selected: false,
	},
})

export const controlBarBottomVariants = recipe({
	base: {
		backgroundColor: colors.neutralN11,
		borderRadius: '2px 2px 0px 0px',
		height: 2,
		transition: 'background-color 1s ease',
	},
	variants: {
		selected: {
			true: {
				backgroundColor: colors.purpleP9,
			},
		},
		hovered: {
			true: {
				backgroundColor: colors.interactiveOutlineSecondaryEnabled,
			},
		},
	},
	compoundVariants: [
		{
			variants: { hovered: true, selected: true },
			style: {
				backgroundColor: colors.purpleP9,
			},
		},
	],
})
