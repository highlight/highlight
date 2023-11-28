import { vars } from '@highlight-run/ui/vars'
import { style } from '@vanilla-extract/css'

export const linkStyle = style({
	textDecoration: 'none',
	color: vars.theme.interactive.fill.secondary.content.text,
	selectors: {
		'&:hover': {
			color: vars.theme.interactive.fill.secondary.content.text,
		},
	},
})

export const betaTag = style({
	marginLeft: '4px',
	paddingLeft: '4px',
	paddingRight: '4px',
	backgroundColor: vars.color.p5,
	color: vars.color.p11,
	fontSize: '11px',
	height: '16px',
	lineHeight: '16px',
	borderRadius: '3px',
	alignSelf: 'center',
})
