import { vars } from '@highlight-run/ui/src/css/vars'
import { style } from '@vanilla-extract/css'

export const repoSelect = style({
	width: '100%',
})

export const example = style({
	background: '#e9e8ea',
	border: `${vars.theme.interactive.outline.secondary.enabled} solid 1px`,
	borderRadius: 6,
	color: vars.theme.static.content.moderate,
	padding: `6px`,
})
