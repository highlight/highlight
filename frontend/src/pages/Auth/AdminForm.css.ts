import { vars } from '@highlight-run/ui'
import { style } from '@vanilla-extract/css'

export const select = style({
	borderRadius: 6,
	border: vars.border.secondary,
	cursor: 'pointer',
	display: 'block',
	padding: '4px 6px',
	fontSize: 13,
	color: vars.theme.static.content.moderate,
	outline: 0,
	width: '100%',

	// For the dropdown indicator
	appearance: 'none',
	backgroundImage: `url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em" fill="none" viewBox="0 0 20 20" focusable="false" > <path fill="grey" fillRule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z" clipRule="evenodd" /> </svg>')`,
	backgroundRepeat: 'no-repeat',
	backgroundPosition: 'right 6px center',

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

export const lastName = style({
	borderTop: 'none',
})
