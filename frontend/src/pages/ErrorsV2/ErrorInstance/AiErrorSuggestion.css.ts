import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const aiSuggestionPrompt = style({
	background:
		'linear-gradient(45deg, rgba(162, 138, 220, 0.08) 0%, rgba(216, 165, 216, 0.08) 50%, rgba(233, 192, 186, 0.08) 100%)',
})

export const aiSuggestion = style({
	position: 'relative',
	zIndex: 1,

	selectors: {
		'&:after': {
			background:
				'linear-gradient(45deg, rgba(162, 138, 220) 0%, rgba(216, 165, 216) 50%, rgba(233, 192, 186) 100%)',
			border: '1px solid transparent',
			content: '',
			borderRadius: 8,
			inset: 0,
			mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
			maskComposite: 'exclude',
			position: 'absolute',
			zIndex: -1,
		},
	},
})

globalStyle(`${aiSuggestion} p`, {
	margin: '0 0 1rem 0 !important',
})

globalStyle(`${aiSuggestion} pre`, {
	background: vars.theme.static.surface.raised,
	borderColor: vars.theme.static.divider.weak,
	borderStyle: 'solid',
	borderRadius: 6,
	borderWidth: 1,
	padding: 10,
})

globalStyle(`${aiSuggestion} code:not([class])`, {
	backgroundColor: 'transparent',
	border: 0,
})

globalStyle(`${aiSuggestion} p:last-child, ${aiSuggestion} ol:last-child`, {
	margin: '0 !important',
})

globalStyle(`${aiSuggestion} ol`, {
	padding: '0 0 0 1.5rem !important',
	margin: '0 0 1rem 0 !important',
})
