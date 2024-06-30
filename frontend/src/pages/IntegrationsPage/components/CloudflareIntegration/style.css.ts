import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const modalBtn = style({
	paddingBottom: 4,
	paddingTop: 4,
})

export const modalBtnIcon = style({
	marginRight: '0.5rem',
})

export const modalSubTitle = style({
	color: `${vars.theme.static.content.default} !important`,
	fontSize: 16,
	marginBottom: 20,
	marginTop: 0,
})
