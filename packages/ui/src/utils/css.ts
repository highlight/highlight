import { ComplexStyleRule } from '@vanilla-extract/css'

const lineClampStyles: ComplexStyleRule = {
	display: '-webkit-box',
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden',
	wordBreak: 'break-all',
}

export function keepsLines(num: number) {
	return {
		...lineClampStyles,
		WebkitLineClamp: num,
		lineClamp: num,
	} as ComplexStyleRule
}
