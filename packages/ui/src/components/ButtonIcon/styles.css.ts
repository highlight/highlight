import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { colors } from '../../css/colors'
import { vars } from '../../css/vars'
import { shadows } from '../Button/styles.css'

export const variants = recipe({
	base: [
		{
			alignItems: 'center',
			display: 'inline-flex',
			justifyContent: 'center',
			border: 'none',
			borderRadius: 6,
			color: vars.theme.interactive.fill.primary.enabled,
			cursor: 'pointer',
			padding: 0,
			outline: 'none',
			flexShrink: 0,
			selectors: {
				'&[disabled], &[disabled]:hover, &[disabled]:focus': {
					boxShadow: 'none',
					color: vars.theme.interactive.fill.primary.content
						.onDisabled,
					cursor: 'not-allowed',
					outline: 'none',
				},
			},
		},
	],

	variants: {
		shape: {
			thin: {},
			square: {},
		},
		emphasis: {
			low: {},
			medium: {},
			high: {},
			none: {
				color: colors.n11,
				backgroundColor: 'inherit',
				selectors: {
					'&:hover:enabled': {
						backgroundColor: vars.color.n4,
						color: colors.n10,
						boxShadow: shadows.grey,
					},
					'&:active:enabled': {
						backgroundColor: vars.color.n5,
						boxShadow: 'none',
					},
				},
			},
		},
		size: {
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
			minimal: {
				height: 20,
				width: 20,
				borderRadius: 4,
			},
		},
		kind: {
			primary: {},
			secondary: {},
		},
	},

	compoundVariants: [
		{
			variants: {
				size: 'xSmall',
				shape: 'thin',
			},
			style: [
				{
					width: 16,
				},
			],
		},
		{
			variants: {
				size: 'small',
				shape: 'thin',
			},
			style: [
				{
					width: 18,
				},
			],
		},
		{
			variants: {
				size: 'medium',
				shape: 'thin',
			},
			style: [
				{
					width: 20,
				},
			],
		},
		{
			variants: {
				emphasis: 'high',
				kind: 'primary',
			},
			style: {
				backgroundColor: vars.theme.interactive.fill.primary.enabled,
				boxShadow: shadows.primary,
				color: vars.color.white,
				selectors: {
					'&:hover:enabled': {
						backgroundColor:
							vars.theme.interactive.fill.primary.hover,
					},
					'&:active:enabled': {
						backgroundColor:
							vars.theme.interactive.fill.primary.pressed,
						boxShadow: 'none',
					},
					'&[disabled]': {
						backgroundColor:
							vars.theme.interactive.fill.primary.disabled,
					},
				},
			},
		},
		{
			variants: {
				emphasis: 'medium',
				kind: 'primary',
			},
			style: {
				backgroundColor: vars.theme.interactive.overlay.primary.enabled,
				border: vars.border.primary,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.primary.enabled,
				selectors: {
					'&[disabled]': {
						border: vars.border.primaryDisabled,
					},
					'&:hover:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.hover,
						border: vars.border.primaryHover,
					},
					'&:active:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.pressed,
						border: vars.border.primaryPressed,
					},
				},
			},
		},
		{
			variants: {
				emphasis: 'low',
				kind: 'primary',
			},
			style: {
				backgroundColor: vars.theme.interactive.overlay.primary.enabled,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.primary.enabled,
				selectors: {
					'&:hover:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.hover,
					},
					'&:active:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.pressed,
					},
				},
			},
		},
		{
			variants: {
				emphasis: 'high',
				kind: 'secondary',
			},
			style: {
				backgroundColor: vars.theme.interactive.fill.secondary.enabled,
				color: vars.theme.interactive.fill.secondary.content.text,
				boxShadow: shadows.grey,
				selectors: {
					'&:hover:enabled': {
						backgroundColor:
							vars.theme.interactive.fill.secondary.hover,
					},
					'&:active:enabled': {
						backgroundColor:
							vars.theme.interactive.fill.secondary.pressed,
						boxShadow: 'none',
					},
					'&[disabled]': {
						backgroundColor:
							vars.theme.interactive.fill.secondary.disabled,
						color: vars.theme.interactive.fill.secondary.content
							.onDisabled,
					},
				},
			},
		},
		{
			variants: {
				emphasis: 'medium',
				kind: 'secondary',
			},
			style: {
				backgroundColor: 'transparent',
				border: vars.border.secondary,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&[disabled]': {
						border: vars.border.secondaryDisabled,
						color: vars.theme.interactive.fill.secondary.content
							.onDisabled,
					},
					'&:hover:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.hover,
						border: vars.border.secondaryHover,
					},
					'&:active:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.pressed,
						border: vars.border.secondaryPressed,
					},
				},
			},
		},
		{
			variants: {
				emphasis: 'low',
				kind: 'secondary',
			},
			style: {
				backgroundColor:
					vars.theme.interactive.overlay.secondary.enabled,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&[disabled]': {
						color: vars.theme.interactive.fill.secondary.content
							.onDisabled,
					},
					'&:hover:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.hover,
					},
					'&:active:enabled': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.pressed,
					},
				},
			},
		},
	],

	defaultVariants: {
		kind: 'primary',
		emphasis: 'medium',
		shape: 'square',
		size: 'small',
	},
})

export type Variants = RecipeVariants<typeof variants>
