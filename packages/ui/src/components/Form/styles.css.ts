import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const inputLabel = style({
	color: '#908e96',
	fontSize: 11,
	fontWeight: '500',
	marginBottom: 6,
})

export const variants = recipe({
	base: {
		backgroundColor: 'white',
		border: 'none',
		borderRadius: 6,
		fontSize: 13,
		padding: '4px 6px',
		selectors: {
			'&:focus, &:active, &::selection': {
				border: 'none',
				outline: 0,
			},
		},
	},
	variants: {
		size: {
			xSmall: {
				height: 20,
			},
			small: {
				height: 28,
			},
		},
		collapsed: {
			true: {
				width: 0,
				padding: 0,
				border: 'none',
			},
			false: {
				width: '100%',
			},
		},
	},
	defaultVariants: {
		size: 'small',
	},
})

export type Variants = RecipeVariants<typeof variants>
