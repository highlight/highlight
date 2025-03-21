import { RecipeVariants, recipe } from '@vanilla-extract/recipes'
import { sprinkles } from '../../css/sprinkles.css'
import { style } from '@vanilla-extract/css'
import { vars } from '@/vars'

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

// Create a base style for the checkbox
export const checkboxBase = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: '4px',
	cursor: 'pointer',
})

// Size variants for checkbox
export const checkboxSize = recipe({
	base: checkboxBase,
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

// .check {
// 	display: block;
// 	border-radius: 9999px;
// 	background-color: hsl(204 20% 94%);
// 	padding: 0.125rem;
// 	font-size: 1.125rem;
// 	line-height: 1.75rem;
// 	transition-property: stroke-dashoffset;
// 	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
// 	transition-duration: 150ms;
// 	border: inherit;
// 	stroke-dasharray: 15;
// 	stroke-dashoffset: 15;
//   }

//   .check[data-checked="true"] {
// 	background-color: hsl(204 100% 40%);
// 	color: white;
// 	stroke-dashoffset: 0;
//   }

//   .check:where(.dark, .dark *) {
// 	background-color: hsl(204 4% 10%);
//   }

//   .check:where(.dark, .dark *)[data-checked="true"] {
// 	background-color: hsl(204 100% 40%);
//   }

export const checkMark = style({
	display: 'block',

	borderRadius: '4px',
	border: `1px solid ${vars.theme.interactive.outline.primary.enabled}`,
	backgroundColor: vars.theme.interactive.fill.primary.enabled,

	padding: '0.125rem',
	fontSize: '1.125rem',
	lineHeight: '1.75rem',
	transitionProperty: 'stroke-dashoffset',
	transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
	transitionDuration: '150ms',
	strokeDasharray: '15',
	strokeDashoffset: '15',
	selectors: {
		'&[data-checked="true"]': {
			backgroundColor: vars.theme.interactive.fill.primary.enabled,
			color: 'white',
			strokeDashoffset: '0',
		},
		'&:where(.dark, .dark *)': {
			backgroundColor: vars.theme.interactive.fill.secondary.enabled,
		},
		'&:where(.dark, .dark *)[data-checked="true"]': {
			backgroundColor: vars.theme.interactive.fill.primary.enabled,
		},
	},
})
