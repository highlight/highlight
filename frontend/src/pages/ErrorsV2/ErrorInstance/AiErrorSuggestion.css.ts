import { globalStyle, style } from '@vanilla-extract/css'

export const aiSuggestionPrompt = style({
	background:
		'linear-gradient(45deg, rgba(162, 138, 220, 0.08) 0%, rgba(216, 165, 216, 0.08) 50%, rgba(233, 192, 186, 0.08) 100%)',
	backgroundSize: '450% 450%',
})

export const aiSuggestion = style({
	boxShadow: '0 0 1px 1px rgba(0, 0, 0, 0.05) inset',
})

globalStyle(`${aiSuggestion} p`, {
	margin: '0 0 1rem 0 !important',
})

globalStyle(`${aiSuggestion} pre`, {
	background: 'rgba(255, 255, 255, 0.6)',
	border: '1px solid rgba(255, 255, 255, 0.8)',
	borderRadius: 6,
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
