import { style } from '@vanilla-extract/css'
import { vars } from '../../css/vars'

export const container = style({
	background: vars.theme.static.surface.nested,
	width: '100%',
	height: '100%',
})

export const resultsContainer = style({
	width: '100%',
	height: 500, // TODO(spenny): figure this out
	display: 'flex',
	flexDirection: 'column',
	paddingLeft: 8,
	overflowX: 'hidden',
	overflowY: 'auto',
	wordWrap: 'break-word',
})
