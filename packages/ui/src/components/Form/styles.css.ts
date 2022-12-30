import { recipe, RecipeVariants } from '@vanilla-extract/recipes'
import { vars } from '../../css/vars'

export const inputVariants = recipe({
	base: {
		borderRadius: 6,
		border: 'none',
		padding: '4px 6px',
		fontSize: 13,
		color: vars.theme.static.content.default,
		textOverflow: 'ellipsis',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		caretColor: vars.theme.interactive.fill.primary.enabled,
		selectors: {
			'&:focus, &:active, &::selection': {
				outline: 0,
			},
			'&:placeholder-shown:hover': {
				background: vars.theme.interactive.overlay.secondary.hover,
				border: vars.border.secondaryHover,
			},
			'&::placeholder': {
				color: vars.theme.interactive.fill.secondary.content.onDisabled,
			},
		},
	},
	variants: {
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
			},
			false: {
				width: '100%',
			},
		},
		outline: {
			true: {
				border: vars.border.secondary,
			},
		},
	},
})

export type Variants = RecipeVariants<typeof inputVariants>
