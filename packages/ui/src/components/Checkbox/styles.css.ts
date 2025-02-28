import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { style } from '@vanilla-extract/css'
import { vars } from '../../vars'

export const variants = recipe({
	variants: {
		size: {
			small: sprinkles({ px: '4', py: '6' }),
			medium: sprinkles({ px: '4', py: '7' }),
			large: sprinkles({ px: '6', py: '8' }),
		},
	},

	defaultVariants: {
		size: 'medium',
	},
})

export type Variants = RecipeVariants<typeof variants>

// Base checkbox style
export const checkbox = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: '4px',
	border: vars.border.secondary,
	backgroundColor: 'white',
	cursor: 'pointer',
	transition: 'all 0.2s ease',
	':hover': {
		borderColor: vars.color.p9,
	},
})

// Size variants for checkbox
export const checkboxSize = recipe({
	variants: {
		size: {
			small: {
				width: '14px',
				height: '14px',
			},
			medium: {
				width: '16px',
				height: '16px',
			},
			large: {
				width: '20px',
				height: '20px',
			},
		},
	},
	defaultVariants: {
		size: 'medium',
	},
})

export const input = style({
	position: 'absolute',
	opacity: 0,
	width: '100%',
	height: '100%',
	cursor: 'pointer',
	margin: 0,
	padding: 0,
})

export const checkIcon = style({
	position: 'absolute',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	color: 'white',
	pointerEvents: 'none',
})

// Size variants for the check icon
export const checkIconSize = recipe({
	variants: {
		size: {
			small: {
				transform: 'scale(0.8)',
			},
			medium: {
				transform: 'scale(1)',
			},
			large: {
				transform: 'scale(1.2)',
			},
		},
	},
	defaultVariants: {
		size: 'medium',
	},
})
