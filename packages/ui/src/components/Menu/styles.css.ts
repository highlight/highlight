import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'
import { vars } from '../../css/vars'
import * as buttonStyles from '../Button/styles.css'
import { typographyStyles } from '../Text/styles.css'
import { sprinkles } from '../../css/sprinkles.css'

export const menuList = style({
	backgroundColor: 'white',
	border: vars.border.secondary,
	borderRadius: vars.borderRadius[4],
	paddingBottom: vars.space[4],
	paddingTop: vars.space[4],
	width: 'fit-content',
	maxWidth: 320,
	minWidth: 200,
	boxShadow: '0 6px 12px -2px rgba(59, 59, 59, .12)',
	zIndex: 6,
})

export const menuItemVariants = recipe({
	base: [
		sprinkles({
			px: '8',
			py: '4',
			display: 'flex',
			alignItems: 'center',
		}),
		{
			minHeight: 20,
			color: vars.theme.interactive.fill.secondary.content.text,
			cursor: 'pointer',
			...typographyStyles.size.small,
			selectors: {
				'&[aria-disabled]': {
					cursor: 'default',
					opacity: '0.5',
				},
				'&[data-active-item], &:hover': {
					backgroundColor:
						vars.theme.interactive.overlay.secondary.hover,
				},
			},
		},
	],
	variants: {
		selected: {
			true: {
				backgroundColor:
					vars.theme.interactive.overlay.secondary.enabled,
			},
			false: {},
		},
	},
	defaultVariants: {
		selected: false,
	},
})

export const menuDivider = style({
	backgroundColor: vars.theme.static.divider.default,
	border: 0,
	height: 1,
	marginBottom: vars.space[4],
	marginTop: vars.space[4],
})

export const menuHeading = style({
	alignItems: 'center',
	display: 'flex',
	height: 16,
	justifyContent: 'space-between',
	paddingRight: vars.space[8],
	paddingLeft: vars.space[8],
	width: '100%',
})

export type ButtonVariants = RecipeVariants<typeof buttonStyles.variants>
