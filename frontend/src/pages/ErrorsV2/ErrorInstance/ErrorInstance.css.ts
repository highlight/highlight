import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const animateGradient = keyframes({
	'0%': {
		backgroundPosition: '0% 0%',
	},
	'100%': {
		backgroundPosition: '100% 100%',
	},
})

export const aiSuggestion = style({
	background:
		'linear-gradient(45deg, #f7d8fe 0%, #b5bbff 20%, #fac492 40%, #f7d8fe 60%, #b5bbff 80%, #fac492 100%)',
	backgroundSize: '450% 450%',
	boxShadow: '0 0 1px 1px rgba(0, 0, 0, 0.05) inset',
})

export const aiSuggestionAnimated = style({
	animation: `${animateGradient} 4s linear infinite`,
})

globalStyle(`${aiSuggestion} p`, {
	margin: '0 0 1rem 0 !important',
})

globalStyle(`${aiSuggestion} pre`, {
	background: 'rgba(255, 255, 255, 0.5)',
	border: '1px solid rgba(255, 255, 255, 0.5)',
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
