import { recipe, RecipeVariants } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'
import { shadows } from '../Button/styles.css'

export const defaultSize = 'small'

export const variants = recipe({
	base: [
		{
			alignItems: 'center',
			display: 'inline-flex',
			justifyContent: 'center',
			height: 28,
			width: 26,
			boxShadow: 'none',
			border: 'none',
			padding: '0',
		},
		sprinkles({ borderRadius: '6' }),
		{
			selectors: {
				'&:focus': {
					border: 0,
					boxShadow: 'none',
					outline: 'none',
				},
				'&:hover': {
					cursor: 'pointer',
				},
			},
		},
	],

	variants: {
		variant: {
			checked: {
				background: vars.theme.interactive.fill.primary.enabled,
				color: vars.color.white,
				boxShadow: shadows.primary,
				selectors: {
					'&:hover': {
						background: vars.theme.interactive.fill.primary.hover,
					},
					'&:active': {
						background: vars.theme.interactive.fill.primary.pressed,
					},
					'&:disabled': {
						color: vars.theme.interactive.fill.primary.disabled,
					},
				},
			},
			unchecked: {
				background: vars.theme.interactive.fill.secondary.enabled,
				boxShadow: shadows.grey,
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&:hover': {
						background: vars.theme.interactive.fill.secondary.hover,
						color: vars.theme.interactive.fill.secondary.content
							.text,
					},
					'&:active': {
						background:
							vars.theme.interactive.fill.secondary.pressed,
						color: vars.theme.interactive.fill.secondary.content
							.text,
					},
					'&:disabled': {
						background:
							vars.theme.interactive.fill.secondary.disabled,
						color: vars.theme.interactive.fill.secondary.content
							.onDisabled,
					},
				},
			},
		},
	},

	defaultVariants: {
		variant: 'unchecked',
	},
})

export type Variants = RecipeVariants<typeof variants>
