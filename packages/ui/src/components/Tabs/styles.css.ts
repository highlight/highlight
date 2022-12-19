import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { colors } from '../../css/colors'
import { style } from '@vanilla-extract/css'

export const pageWrapper = style({
	borderTop: `1px solid ${colors.neutralN6}`,
	width: '100%',
	height: '100%',
})

export const controlBarButton = style({
	backgroundColor: 'white',
	boxShadow: 'none',
	color: colors.neutralN11,
})

export const tabText = style({
	display: 'flex',
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

export const variants = recipe({
	variants: {
		mode: {
			light: sprinkles({ background: 'white', color: 'black' }),
			dark: sprinkles({ background: 'purple900', color: 'white' }),
		},
	},

	defaultVariants: {
		mode: 'light',
	},
})

export type Variants = RecipeVariants<typeof variants>
