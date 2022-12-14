import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'
import { vars } from '../../css/vars'
import * as buttonStyles from '../Button/styles.css'
import { typographyStyles } from '../Text/styles.css'
import { sprinkles } from '../../css/sprinkles.css'

export const menuList = style({
	backgroundColor: 'white',
	border: vars.border.neutral,
	borderRadius: vars.borderRadius[4],
	paddingBottom: vars.space[4],
	paddingTop: vars.space[4],
	width: 'fit-content',
	maxWidth: 300,
	minWidth: 200,
	boxShadow: '0 6px 12px -2px rgba(59, 59, 59, .12)',
})

export const menuItemVariants = recipe({
	base: {
		cursor: 'pointer',
		padding: vars.space[8],
		...typographyStyles.size.small,
		selectors: {
			'&[aria-disabled]': {
				cursor: 'default',
				opacity: '0.5',
			},
			'&[data-active-item], &:hover': {
				backgroundColor: vars.color.neutral100,
			},
		},
	},
	variants: {
		selected: {
			true: sprinkles({
				background: 'neutral100',
			}),
			false: {},
		},
	},
	defaultVariants: {
		selected: false,
	},
})

export const menuDivider = style({
	backgroundColor: vars.color.neutral200,
	border: 0,
	height: 1,
	marginBottom: vars.space[4],
	marginTop: vars.space[4],
})

export type ButtonVariants = RecipeVariants<typeof buttonStyles.variants>
