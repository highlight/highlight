import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'
import { shadows } from '../Button/styles.css'

export const variants = recipe({
	base: [
		{
			alignItems: 'center',
			boxShadow: 'none',
			display: 'inline-flex',
			justifyContent: 'center',
			padding: 4,
		},
		sprinkles({ borderRadius: '6' }),
		{
			selectors: {
				'&:hover': {
					cursor: 'pointer',
				},
			},
		},
	],

	variants: {
		size: {
			xxSmall: {
				height: 16,
				width: 16,
			},
			xSmall: {
				height: 24,
				width: 24,
			},
			small: {
				height: 28,
				width: 28,
			},
			medium: {
				height: 32,
				width: 32,
			},
		},
		variant: {
			checked: {
				background: vars.theme.interactive.fill.primary.enabled,
				border: 0,
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
						background:
							vars.theme.interactive.fill.primary.disabled,
						color: vars.theme.interactive.fill.primary.content
							.onDisabled,
					},
				},
			},
			unchecked: {
				background: vars.theme.interactive.overlay.secondary.enabled,
				border: vars.border.secondary,
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&:hover': {
						background:
							vars.theme.interactive.overlay.secondary.hover,
						border: vars.border.secondaryHover,
						color: vars.theme.interactive.fill.secondary.content
							.text,
					},
					'&:active': {
						background:
							vars.theme.interactive.overlay.secondary.pressed,
						border: vars.border.secondaryPressed,
						color: vars.theme.interactive.fill.secondary.content
							.text,
					},
					'&:disabled': {
						background:
							vars.theme.interactive.overlay.secondary.disabled,
						border: vars.border.secondaryDisabled,
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
