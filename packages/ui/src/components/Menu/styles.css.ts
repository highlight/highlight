import { style } from '@vanilla-extract/css'
import { RecipeVariants } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { themeVars } from '../../css/theme.css'
import { vars } from '../../css/vars'
import * as buttonStyles from '../Button/styles.css'
import { typographyStyles } from '../Text/styles.css'

export const menuList = style({
	backgroundColor: 'white',
	border: vars.border.neutral,
	borderRadius: vars.borderRadius[4],
	paddingBottom: vars.space[4],
	paddingTop: vars.space[4],
	width: 'fit-content',
	maxWidth: 300,
	minWidth: 200,
})

export const menuItem = style({
	cursor: 'pointer',
	padding: vars.space[8],

	selectors: {
		'&[data-active-item], &:hover': {
			backgroundColor: vars.color.neutral100,
		},
	},
})

export const menuDivider = style({
	backgroundColor: vars.color.neutral200,
	border: 0,
	height: 1,
	marginBottom: vars.space[4],
	marginTop: vars.space[4],
})

export const buttonVariants = buttonStyles.variants
export type ButtonVariants = RecipeVariants<typeof buttonStyles.variants>
