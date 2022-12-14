import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
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
			cursor: 'pointer',
			padding: 0,
			outline: 'none',
			selectors: {
				'&[disabled]': {
					cursor: 'not-allowed',
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
				color: colors.neutralN11,
				backgroundColor: 'inherit',
				selectors: {
					'&:hover:enabled': {
						background: vars.color.neutralN4,
						color: colors.neutralN10,
						boxShadow: shadows.grey,
					},
					'&:focus:enabled, &:active:enabled': {
						background: vars.color.neutralN5,
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
				background: vars.color.purple500,
				color: vars.color.white,
				boxShadow: shadows.primary,
				selectors: {
					'&:hover:enabled': {
						background: vars.color.purple700,
					},
					'&:focus:enabled, &:active:enabled': {
						background: vars.color.purple700,
						boxShadow: 'none',
					},
					'&[disabled]': {
						background: vars.color.purple100,
						color: vars.color.neutral50,
						boxShadow: 'none',
						outline: 'none',
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
				background: 'transparent',
				color: vars.color.purple500,
				boxShadow: 'none',
				border: vars.border.neutral,
				selectors: {
					'&[disabled]': {
						color: vars.color.purple100,
						border: vars.border.purpleLight,
						boxShadow: 'none',
						outline: 'none',
					},
					'&:hover:enabled': {
						color: vars.color.purple700,
						border: vars.border.neutralDark,
					},
					'&:focus:enabled, &:active:enabled': {
						color: vars.color.purple700,
						border: vars.border.purple,
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
				background: 'transparent',
				color: vars.color.purple500,
				boxShadow: 'none',
				selectors: {
					'&[disabled]': {
						color: vars.color.purple100,
					},
					'&:hover:enabled': {
						background: vars.color.neutral200,
						color: vars.color.purple900,
					},
					'&:focus:enabled, &:active:enabled': {
						background: vars.color.neutral200,
						color: vars.color.purple700,
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
				background: vars.color.neutral100,
				color: vars.color.neutral700,
				boxShadow: shadows.grey,
				selectors: {
					'&:hover:enabled': {
						background: vars.color.neutral200,
					},
					'&:focus:enabled, &:active:enabled': {
						background: vars.color.neutral200,
						boxShadow: 'none',
					},
					'&[disabled]': {
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
				kind: 'secondary',
			},
			style: {
				background: 'transparent',
				color: vars.color.neutral700,
				boxShadow: 'none',
				border: vars.border.neutral,
				selectors: {
					'&[disabled]': {
						color: vars.color.neutral300,
						boxShadow: 'none',
						outline: 'none',
					},
					'&:hover:enabled': {
						background: vars.color.neutral50,
						border: vars.border.neutralDark,
					},
					'&:focus:enabled, &:active:enabled': {
						background: vars.color.neutral100,
						border: vars.border.neutralDark,
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
				background: 'transparent',
				color: vars.color.neutral500,
				boxShadow: 'none',
				selectors: {
					'&[disabled]': {
						color: vars.color.neutral300,
					},
					'&:hover:enabled': {
						background: vars.color.neutral200,
						color: vars.color.neutral700,
					},
					'&:focus:enabled, &:active:enabled': {
						background: vars.color.neutral200,
						color: vars.color.neutral500,
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
