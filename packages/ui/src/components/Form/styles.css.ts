import { recipe, RecipeVariants } from '@vanilla-extract/recipes'
import { colors } from '../../css/colors'
import { vars } from '../../css/vars'
import { typographyStyles } from '../Text/styles.css'

export const inputVariants = recipe({
	base: {
		border: 'none',
		fontSize: 13,
		color: vars.theme.static.content.default,
		caretColor: vars.theme.interactive.fill.primary.enabled,
		outline: 0,
		width: '100%',
		selectors: {
			'&::placeholder': {
				color: vars.theme.interactive.fill.secondary.content.onDisabled,
				fontFamily: typographyStyles.family.body.fontFamily,
			},
			'&:disabled': {
				background: colors.n5,
			},
		},
	},
	variants: {
		truncate: {
			true: {
				textOverflow: 'ellipsis',
				overflow: 'hidden',
				whiteSpace: 'nowrap',
			},
			false: {},
		},
		size: {
			xSmall: {
				height: 20,
			},
			small: {
				height: 28,
			},
		},
		collapsed: {
			true: {
				width: 0,
				padding: 0,
				border: 'none',
				selectors: {
					'&:focus, &:active, &:placeholder-shown:hover': {
						border: 'none',
					},
				},
			},
			false: {},
		},
		outline: {
			true: {
				borderRadius: 6,
				padding: '4px 6px',
				border: vars.border.secondary,
				selectors: {
					'&:focus, &:active': {
						border: vars.border.secondaryPressed,
					},
					'&:placeholder-shown:hover': {
						background:
							vars.theme.interactive.overlay.secondary.hover,
						border: vars.border.secondaryHover,
					},
				},
			},
			false: {
				padding: 0,
				border: 'none',
			},
		},
	},
	defaultVariants: {
		outline: true,
		truncate: false,
	},
})

export type Variants = RecipeVariants<typeof inputVariants>
