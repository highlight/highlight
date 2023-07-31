import { style } from '@vanilla-extract/css'
import { vars } from '../../css/vars'

export const container = style({
	background: vars.theme.static.surface.nested,
	width: '100%',
	height: '100%',
})

export const header = style({
	display: 'grid',
	gridTemplateColumns: '100px 80px 80px',
	gridGap: 6,
	borderBottom: `1px solid ${vars.theme.interactive.fill.secondary.pressed}`,
	padding: '12px 14px 10px',
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
