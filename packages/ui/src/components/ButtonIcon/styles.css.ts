import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
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
		},
		size: {
			tiny: [
				sprinkles({ py: '6' }),
				{
					height: 24,
				},
			],
			small: [
				sprinkles({ py: '7' }),
				{
					height: 28,
				},
			],
			medium: [
				sprinkles({ py: '9' }),
				{
					height: 32,
				},
			],
		},
		variant: {
			primary: {},
			secondary: {},
		},
	},

	compoundVariants: [
		{
			variants: {
				size: 'tiny',
				shape: 'thin',
			},
			style: [
				sprinkles({ px: '2' }),
				{
					width: 16,
				},
			],
		},
		{
			variants: {
				size: 'tiny',
				shape: 'square',
			},
			style: [
				sprinkles({ px: '6' }),
				{
					width: 24,
				},
			],
		},
		{
			variants: {
				size: 'small',
				shape: 'thin',
			},
			style: [
				sprinkles({ px: '2' }),
				{
					width: 18,
				},
			],
		},
		{
			variants: {
				size: 'small',
				shape: 'square',
			},
			style: [
				sprinkles({ px: '7' }),
				{
					width: 28,
				},
			],
		},
		{
			variants: {
				size: 'medium',
				shape: 'thin',
			},
			style: [
				sprinkles({ px: '3' }),
				{
					width: 20,
				},
			],
		},
		{
			variants: {
				size: 'medium',
				shape: 'square',
			},
			style: [
				sprinkles({ px: '9' }),
				{
					width: 28,
				},
			],
		},
		{
			variants: {
				emphasis: 'high',
				variant: 'secondary',
			},
			style: {
				background: vars.color.neutral100,
				color: vars.color.neutral700,
				boxShadow: shadows.grey,
				selectors: {
					'&:hover': {
						background: vars.color.neutral200,
					},
					'&:focus, &:active': {
						background: vars.color.neutral200,
						boxShadow: 'none',
					},
					'&:disabled, &:disabled:hover, &:disabled:focus': {
						background: vars.color.neutral50,
						color: vars.color.neutral300,
						boxShadow: 'none',
						outline: 'none',
					},
				},
			},
		},
		{
			variants: {
				emphasis: 'medium',
				variant: 'secondary',
			},
			style: {
				background: 'transparent',
				color: vars.color.neutral700,
				boxShadow: 'none',
				border: vars.border.neutral,
				selectors: {
					'&:disabled, &:disabled:hover, &:disabled:focus': {
						color: vars.color.neutral300,
						boxShadow: 'none',
						outline: 'none',
					},
					'&:hover': {
						background: vars.color.neutral50,
						border: vars.border.neutralDark,
					},
					'&:focus, &:active': {
						background: vars.color.neutral100,
						border: vars.border.neutralDark,
					},
				},
			},
		},
		{
			variants: {
				emphasis: 'low',
				variant: 'secondary',
			},
			style: {
				background: 'transparent',
				color: vars.color.neutral500,
				boxShadow: 'none',
				selectors: {
					'&:disabled, &:disabled:hover, &:disabled:focus': {
						color: vars.color.neutral300,
					},
					'&:hover': {
						background: vars.color.neutral100,
						color: vars.color.neutral700,
						border: vars.border.neutralDark,
					},
					'&:focus, &:active': {
						background: vars.color.neutral100,
						color: vars.color.neutral700,
						border: vars.border.neutralDark,
					},
				},
			},
		},
	],

	defaultVariants: {
		variant: 'primary',
		emphasis: 'medium',
		shape: 'square',
		size: 'small',
	},
})

export type Variants = RecipeVariants<typeof variants>
