import { sMonotype, typographyStyles } from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const comboboxTagsContainer = style([
	typographyStyles.family.monospace,
	sMonotype,
	{
		border: vars.border.secondary,
		borderRadius: vars.borderRadius[4],
		display: 'flex',
		flexWrap: 'wrap',
		overflow: 'auto',
		padding: 4,
		width: '100%',
		whiteSpace: 'pre',
	},
])

export const comboboxTag = style({
	display: 'inline-flex',
	fontFeatureSettings: 'normal', // disable tabular numbers
	margin: '2px 0',
	padding: 0,
	whiteSpace: 'pre',
})

export const comboboxTagBackground = style({
	border: vars.border.secondary,
	borderRadius: vars.borderRadius[4],
	height: 20,
	letterSpacing: 'normal',
	position: 'absolute',
	left: -2,
	right: -2,
	width: 'calc(100% + 4px)',
})
