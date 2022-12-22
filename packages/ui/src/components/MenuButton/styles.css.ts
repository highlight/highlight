import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { typographyStyles } from '../Text/styles.css'
import { colors } from '../../css/colors'

export const variants = recipe({
	base: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.white,
		border: `1px solid ${colors.n6}`,
		borderRadius: 6,
		boxShadow: 'none',
		padding: '2px 4px',
	},
	variants: {
		size: {
			medium: {
				height: 22,
				...typographyStyles.size.small,
			},
		},
	},

	defaultVariants: {
		size: 'medium',
	},
})

export type Variants = RecipeVariants<typeof variants>
