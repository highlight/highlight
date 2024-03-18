import { style } from '@vanilla-extract/css'
import { recipe, RecipeVariants } from '@vanilla-extract/recipes'

export const weekDays = style({
	alignItems: 'center',
	display: 'grid',
	gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
	height: '2rem',
	rowGap: '0.5rem',
})

export const days = style({
	alignItems: 'center',
	display: 'grid',
	gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
	rowGap: '0.5rem',
})

export const variants = recipe({})

export type Variants = RecipeVariants<typeof variants>
