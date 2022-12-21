import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'
import { typographyStyles } from '../Text/styles.css'

export const shadows = {
	grey: 'inset 0px -1px 0px rgba(0, 0, 0, 0.1)',
	primary: 'inset 0px -1px 0px rgba(0, 0, 0, 0.32)',
} as const

export const defaultSize = 'small'

export const iconVariants = recipe({
	base: {
		alignItems: 'center',
		display: 'inline-flex',
		justifyContent: 'center',
		selectors: {
			'&[disabled]': {
				color: vars.theme.interactive.fill.primary.disabled,
				pointerEvents: 'none',
				userSelect: 'none',
			},
		},
	},

	variants: {
		size: {
			xSmall: { height: 12, width: 12, ...typographyStyles.size.xSmall },
			small: { height: 12, width: 12, ...typographyStyles.size.small },
			medium: { height: 14, width: 14, ...typographyStyles.size.small },
			large: { height: 16, width: 16, ...typographyStyles.size.small },
			xLarge: { height: 16, width: 16, ...typographyStyles.size.large },
		},
		emphasis: {
			high: {},
			medium: {},
			low: {},
		},
		kind: {
			primary: {
				color: vars.theme.interactive.fill.primary.content.text,
			},
			secondary: {
				color: vars.theme.interactive.fill.secondary.content.text,
			},
		},
	},

	compoundVariants: [
		{
			variants: {
				kind: 'primary',
				emphasis: 'high',
			},
			style: {
				color: vars.theme.interactive.fill.primary.content.onEnabled,
			},
		},
	],

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
		}),
		{
			lineHeight: '1em',
			width: 'auto',
			backgroundColor: 'transparent',
			outline: 'none',
			selectors: {
				'&:hover': {
					cursor: 'pointer',
				},
				'&[disabled]': {
					pointerEvents: 'none',
					userSelect: 'none',
				},
			},
		},
	],

	variants: {
		emphasis: {
			high: {},
			medium: {},
			low: {},
		},
		kind: {
			primary: {
				color: vars.theme.interactive.fill.primary.content.text,
			},
			secondary: {
				color: vars.theme.interactive.fill.primary.content.text,
			},
		},
		size: {
			xSmall: [
				sprinkles({ borderRadius: '4', gap: '4', px: '6' }),
				{ height: 24 },
			],
			small: [
				sprinkles({ borderRadius: '6', gap: '6', px: '6' }),
				{ height: 28 },
			],
			medium: [
				sprinkles({ borderRadius: '6', gap: '6', px: '8' }),
				{ height: 32 },
			],
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
				border: vars.border.interactivePrimaryEnabled,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.primary.content.text,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.hover,
						border: vars.border.interactivePrimaryHover,
					},
					'&:active': {
						backgroundColor:
							vars.theme.interactive.overlay.primary.pressed,
						border: vars.border.interactivePrimaryPressed,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						border: vars.border.interactivePrimaryDisabled,
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
				color: vars.theme.interactive.fill.secondary.content.onEnabled,
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
				border: vars.border.interactiveSecondaryEnabled,
				boxShadow: 'none',
				color: vars.theme.interactive.fill.secondary.content.text,
				selectors: {
					'&:hover': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.hover,
						border: vars.border.interactiveSecondaryHover,
					},
					'&:active': {
						border: vars.border.interactiveSecondaryPressed,
						backgroundColor:
							vars.theme.interactive.overlay.secondary.pressed,
					},
					'&[disabled], &[disabled]:hover, &[disabled]:focus': {
						backgroundColor:
							vars.theme.interactive.overlay.secondary.disabled,
						border: vars.border.interactiveSecondaryDisabled,
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
	],
	defaultVariants: {
		kind: 'primary',
		emphasis: 'high',
		size: defaultSize,
	},
})

export type Variants = RecipeVariants<typeof variants>
