import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { vars } from '../../css/vars'

export const shadows = {
	grey: 'inset 0px -1px 0px rgba(0, 0, 0, 0.1)',
	primary: 'inset 0px -1px 0px rgba(0, 0, 0, 0.32)',
} as const

export const defaultShape = 'rounded'
export const defaultSize = 'medium'
export const defaultKind = 'primary'

export const iconVariants = recipe({
	base: {
		alignItems: 'center',
		border: 'none',
		display: 'inline-flex',
		justifyContent: 'center',
	},

	variants: {
		size: {
			small: { height: 12, width: 12 },
			medium: { height: 12, width: 12 },
			large: { height: 16, width: 16 },
		},
		kind: {
			transparent: {
				color: vars.color.neutral500,
				selectors: {
					'&:hover': {
						color: vars.color.neutral700,
					},
					'&:focus, &:active': {
						color: vars.color.neutral500,
					},
				},
			},
			primary: {
				color: vars.color.purple100,
				selectors: {
					'&:hover': {
						color: vars.color.white,
					},
					'&:focus, &:active': {
						color: vars.color.purple100,
					},
				},
			},
			white: {
				color: vars.color.neutral500,
				selectors: {
					'&:hover': {
						color: vars.color.neutral700,
					},
					'&:focus, &:active': {
						color: vars.color.neutral500,
					},
				},
			},
			grey: {
				color: vars.color.neutral500,
				selectors: {
					'&:hover': {
						color: vars.color.neutral700,
					},
					'&:focus, &:active': {
						color: vars.color.neutral500,
					},
				},
			},
		},
	},
	defaultVariants: {
		size: defaultSize,
		kind: defaultKind,
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
		},
		{
			selectors: {
				'&:disabled, &:disabled:hover, &:disabled:focus': {
					backgroundColor: vars.color.neutral50,
					border: 0,
					boxShadow: 'none',
					color: vars.color.neutral300,
				},
				'&:focus, &:active': {
					boxShadow: 'none',
					outline: 'none',
					border: 0,
				},
				'&:hover': {
					cursor: 'pointer',
				},
			},
		},
	],

	variants: {
		shape: {
			rounded: {},
			basic: {},
		},
		kind: {
			transparent: {
				background: 'none',
				color: vars.color.neutral700,
				boxShadow: 'none',
				selectors: {
					'&:hover': {
						background: vars.color.neutral100,
						boxShadow: shadows.grey,
					},
					'&:focus, &:active': {
						background: vars.color.neutral200,
					},
				},
			},
			primary: {
				background: vars.color.purple500,
				color: vars.color.white,
				boxShadow: shadows.primary,
				selectors: {
					'&:hover': {
						background: vars.color.purple700,
					},
					'&:focus, &:active': {
						boxShadow: 'none',
					},
				},
			},
			white: {
				background: vars.color.white,
				border: `1px solid ${vars.color.neutral200}`,
				color: vars.color.neutral800,
				selectors: {
					'&:hover': {
						background: vars.color.neutral50,
					},
					'&:focus, &:active': {
						border: `1px solid ${vars.color.neutral300}`,
					},
				},
			},
			grey: {
				background: vars.color.neutral100,
				color: vars.color.neutral800,
				boxShadow: shadows.grey,
				selectors: {
					'&:hover': {
						background: vars.color.neutral200,
					},
					'&:focus, &:active': {
						boxShadow: 'none',
					},
				},
			},
		},
		size: {
			small: { height: 16 },
			medium: { height: 20 },
			large: { height: 24 },
		},
	},

	compoundVariants: [
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
	],
	defaultVariants: {
		kind: defaultKind,
		size: defaultSize,
		shape: defaultShape,
	},
})

export type Variants = RecipeVariants<typeof variants>
