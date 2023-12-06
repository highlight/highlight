import { vars } from '@highlight-run/ui/vars'
import { keyframes, style } from '@vanilla-extract/css'

export const repoSelect = style({
	width: '100%',
})

export const example = style({
	background: vars.color.n5,
	border: `${vars.theme.interactive.outline.secondary.enabled} solid 1px`,
	borderRadius: 6,
	color: vars.theme.static.content.moderate,
	padding: 6,
})

export const tooltipContent = style({
	color: vars.theme.static.content.moderate,
})

export const loading = style({
	opacity: 0.5,
})

export const loadingBoxContainer = style({
	position: 'absolute',
})

const rotate = keyframes({
	'0%': {
		transform: 'rotate(0deg)',
	},
	'100%': {
		transform: 'rotate(360deg)',
	},
})

export const loadingIcon = style({
	animation: `1s ${rotate} linear infinite`,
})
