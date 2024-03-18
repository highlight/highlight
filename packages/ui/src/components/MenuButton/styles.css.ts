import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { colors } from '../../css/colors'
import { typographyStyles } from '../Text/styles.css'

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
