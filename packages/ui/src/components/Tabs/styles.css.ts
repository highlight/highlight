import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { colors } from '../../css/colors'
import { style } from '@vanilla-extract/css'
import { themeVars } from '../../css/theme.css'

export const pageWrapper = style({
	borderTop: `1px solid ${colors.n6}`,
	width: '100%',
	height: '100%',
})

export const controlBarButton = style({
	backgroundColor: 'white',
	boxShadow: 'none',
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
		borderRadius: '2px 2px 0px 0px',
		height: 2,
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

export const variants = recipe({
	variants: {
		mode: {
			light: sprinkles({ background: 'white', color: 'black' }),
			dark: sprinkles({ background: 'p9', color: 'white' }),
		},
	},

	defaultVariants: {
		mode: 'light',
	},
})

export type Variants = RecipeVariants<typeof variants>
