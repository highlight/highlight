import { keepsLines } from '@highlight-run/ui'
import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const errorsContainer = style({
	fontSize: 13,
	height: '100%',
	overflowX: 'hidden',
	overflowY: 'auto',
})

export const errorRowVariants = recipe({
	base: {
		borderRadius: 6,
		color: colors.n11,
		cursor: 'pointer',
		display: 'grid',
		gridTemplateColumns: '3fr 1fr auto 100px 20px',
		gap: 8,
		padding: 8,
		selectors: {
			'&:hover': {
				backgroundColor: themeVars.interactive.overlay.secondary.hover,
			},
		},
	},
	variants: {
		current: {
			true: {},
			false: {},
		},

		selected: {
			true: {
				backgroundColor:
					themeVars.interactive.overlay.secondary.pressed,
				boxShadow: shadows.grey,
			},
			false: {},
		},
	},
})

export const cellContent = style({
	color: themeVars.interactive.fill.secondary.content.onEnabled,
	...keepsLines(1),
})
