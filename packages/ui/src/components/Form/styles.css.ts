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
		rounded: {
			first: { borderRadius: '6px 6px 0 0' },
			middle: { borderRadius: 0 },
			last: { borderRadius: '0 0 6px 6px' },
		},
	},
	defaultVariants: {
		outline: true,
		truncate: false,
	},
})

export type Variants = RecipeVariants<typeof inputVariants>

import { style } from '@vanilla-extract/css'

export const select = style({
	borderRadius: 6,
	border: vars.border.secondary,
	cursor: 'pointer',
	display: 'block',
	padding: '4px 16px',
	fontSize: 13,
	color: vars.theme.static.content.moderate,
	outline: 0,

	// For the dropdown indicator
	appearance: 'none',
	backgroundImage: `url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em" fill="none" viewBox="0 0 20 20" focusable="false" > <path fill="grey" fillRule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z" clipRule="evenodd" /> </svg>')`,
	backgroundRepeat: 'no-repeat',
	backgroundPosition: 'right 4px center',

	selectors: {
		'&::placeholder': {
			color: vars.theme.interactive.fill.secondary.content.onDisabled,
		},
		'&:disabled': {
			background: vars.color.n5,
		},
		'&:focus': {
			border: vars.border.secondaryPressed,
		},
	},
})
