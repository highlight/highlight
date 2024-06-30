import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const shadows = {
	grey: 'inset 0px -1px 0px rgba(0, 0, 0, 0.1)',
	primary: 'inset 0px -1px 0px rgba(0, 0, 0, 0.32)',
} as const

export const defaultEmphasis = 'high'
export const defaultKind = 'primary'
export const defaultShape = 'rounded'
export const defaultSize = 'medium'

export const iconVariants = recipe({
	base: {
		alignItems: 'center',
		border: 'none',
		display: 'inline-flex',
		justifyContent: 'center',
		flexShrink: 0,
	},

	variants: {
		size: {
			small: { height: 12, width: 12 },
			medium: { height: 13, width: 13 },
			large: { height: 16, width: 16 },
		},
	},

	defaultVariants: {
		size: defaultSize,
	},
})

export const variants = recipe({
	base: [
		sprinkles({
			alignItems: 'center',
			border: 'none',
			display: 'inline-flex',
			px: '4',
			py: '2',
			flexShrink: 0,
		}),
		{
			lineHeight: '1em',
			width: 'auto',
			wordBreak: 'break-word',
			textAlign: 'left',
		},
		{
			selectors: {
				'&[disabled], &[disabled]:hover, &[disabled]:focus': {
					backgroundColor:
						vars.theme.interactive.overlay.secondary.disabled,
					border: 0,
					boxShadow: 'none',
					color: vars.theme.interactive.fill.secondary.content
						.onDisabled,
				},
				'&:active': {
					boxShadow: 'none',
					outline: 'none',
					border: 0,
				},
			},
		},
	],

	variants: {
		emphasis: {
			low: {},
			medium: {},
			high: {},
		},
		kind: {
			primary: {},
			secondary: {},
		},
		shape: {
			rounded: {},
			basic: {},
			leftBasic: {},
			rightBasic: {},
			square: {},
		},
		size: {
			small: { minHeight: 16 },
			medium: { minHeight: 20 },
			large: { minHeight: 24 },
		},
	},

	compoundVariants: [
		{
			variants: {
				kind: 'primary',
				emphasis: 'high',
			},
			style: {
				backgroundColor: vars.theme.interactive.fill.primary.enabled,
				boxShadow: shadows.primary,
				color: vars.theme.interactive.fill.primary.content.onEnabled,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.fill.primary.hover,
					},
					'&:active': {
						backgroundColor:
							vars.theme.interactive.fill.primary.pressed,
						boxShadow: 'none',
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						backgroundColor:
							vars.theme.interactive.fill.primary.disabled,
						color: vars.theme.interactive.fill.primary.disabled,
						boxShadow: 'none',
					},
				},
			},
		},
		{
			variants: {
				kind: 'primary',
				emphasis: 'medium',
			},
			style: {
				backgroundColor: vars.theme.interactive.overlay.primary.enabled,
				border: vars.border.primary,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.primary.content.text,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.hover,
						border: vars.border.primaryHover,
					},
					'&:active': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.pressed,
						border: vars.border.primaryPressed,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						border: vars.border.primaryDisabled,
						color: vars.theme.interactive.fill.primary.content
							.onDisabled,
					},
				},
			},
		},
		{
			variants: {
				kind: 'primary',
				emphasis: 'low',
			},
			style: {
				backgroundColor: vars.theme.interactive.overlay.primary.enabled,
				border: vars.border.none,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.primary.content.text,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.hover,
					},
					'&:active': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.pressed,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						color: vars.theme.interactive.fill.primary.content
							.onDisabled,
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'high',
			},
			style: {
				backgroundColor: vars.theme.interactive.fill.secondary.enabled,
				boxShadow: shadows.grey,
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.fill.secondary.hover,
					},
					'&:active': {
						backgroundColor:
							vars.theme.interactive.fill.secondary.pressed,
						boxShadow: 'none',
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						backgroundColor:
							vars.theme.interactive.fill.secondary.disabled,
						color: vars.theme.interactive.fill.secondary.content
							.onDisabled,
						boxShadow: 'none',
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'medium',
			},
			style: {
				backgroundColor:
					vars.theme.interactive.overlay.secondary.enabled,
				border: vars.border.secondary,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.hover,
						border: vars.border.secondaryHover,
					},
					'&:active': {
						border: vars.border.secondaryPressed,
						backgroundColor:
							vars.theme.interactive.overlay.secondary.pressed,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.disabled,
						border: vars.border.secondaryDisabled,
					},
				},
			},
		},
		{
			variants: {
				kind: 'secondary',
				emphasis: 'low',
			},
			style: {
				backgroundColor:
					vars.theme.interactive.overlay.secondary.enabled,
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.hover,
					},
					'&:active': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.pressed,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.disabled,
					},
				},
			},
		},
		{
			variants: {
				size: 'small',
				shape: 'rounded',
			},
			style: [
				sprinkles({ gap: '2', px: '6', py: '0', borderRadius: '23' }),
			],
		},
		{
			variants: {
				size: 'medium',
				shape: 'rounded',
			},
			style: [
				sprinkles({ gap: '3', px: '8', py: '2', borderRadius: '16' }),
			],
		},
		{
			variants: {
				size: 'large',
				shape: 'rounded',
			},
			style: [
				sprinkles({ gap: '3', px: '10', py: '2', borderRadius: '10' }),
			],
		},
		{
			variants: {
				size: 'small',
				shape: 'basic',
			},
			style: [
				sprinkles({ gap: '2', px: '4', py: '0', borderRadius: '3' }),
			],
		},
		{
			variants: {
				size: 'medium',
				shape: 'basic',
			},
			style: [
				sprinkles({ gap: '2', px: '4', py: '2', borderRadius: '5' }),
			],
		},
		{
			variants: {
				size: 'large',
				shape: 'basic',
			},
			style: [
				sprinkles({ gap: '2', px: '6', py: '2', borderRadius: '6' }),
			],
		},
		{
			variants: {
				size: 'small',
				shape: 'leftBasic',
			},
			style: [
				sprinkles({
					gap: '2',
					px: '4',
					py: '0',
					borderTopLeftRadius: '3',
					borderBottomLeftRadius: '3',
				}),
			],
		},
		{
			variants: {
				size: 'medium',
				shape: 'leftBasic',
			},
			style: [
				sprinkles({
					gap: '2',
					px: '4',
					py: '2',
					borderTopLeftRadius: '5',
					borderBottomLeftRadius: '5',
				}),
			],
		},
		{
			variants: {
				size: 'large',
				shape: 'leftBasic',
			},
			style: [
				sprinkles({
					gap: '2',
					px: '6',
					py: '2',
					borderTopLeftRadius: '6',
					borderBottomLeftRadius: '6',
				}),
			],
		},
		{
			variants: {
				size: 'small',
				shape: 'square',
			},
			style: [sprinkles({ gap: '2', px: '4', py: '0' })],
		},
		{
			variants: {
				size: 'medium',
				shape: 'square',
			},
			style: [sprinkles({ gap: '2', px: '4', py: '2' })],
		},
		{
			variants: {
				size: 'large',
				shape: 'square',
			},
			style: [sprinkles({ gap: '2', px: '6', py: '2' })],
		},
		{
			variants: {
				size: 'small',
				shape: 'rightBasic',
			},
			style: [
				sprinkles({
					gap: '2',
					px: '4',
					py: '0',
					borderTopRightRadius: '3',
					borderBottomRightRadius: '3',
				}),
			],
		},
		{
			variants: {
				size: 'medium',
				shape: 'rightBasic',
			},
			style: [
				sprinkles({
					gap: '2',
					px: '4',
					py: '2',
					borderTopRightRadius: '5',
					borderBottomRightRadius: '5',
				}),
			],
		},
		{
			variants: {
				size: 'large',
				shape: 'rightBasic',
			},
			style: [
				sprinkles({
					gap: '2',
					px: '6',
					py: '2',
					borderTopRightRadius: '6',
					borderBottomRightRadius: '6',
				}),
			],
		},
	],

	defaultVariants: {
		emphasis: defaultEmphasis,
		kind: defaultKind,
		size: defaultSize,
		shape: defaultShape,
	},
})

export type Variants = RecipeVariants<typeof variants>
