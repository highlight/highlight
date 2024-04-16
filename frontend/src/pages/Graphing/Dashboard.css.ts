import { vars } from '@highlight-run/ui/vars'
import { globalStyle, style } from '@vanilla-extract/css'

export const editGraphHeader = style({
	height: 40,
})

export const dashboardContent = style({
	height: 'calc(100% - 40px)',
})

export const headerDivider = style({
	width: 1,
	backgroundColor: vars.theme.static.divider.weak,
	margin: '4px 2px',
})

export const graphBackground = style({
	zIndex: 0,
})

export const editGraphSidebar = style({
	width: 320,
})

export const editorLabel = style({
	marginBottom: 4,
})

export const menuButton = style({
	border: vars.border.divider,
	width: '100%',
})

export const input = style({
	height: 28,
})

export const graphGrid = style({
	overflow: 'auto',
	display: 'grid',
	width: '100%',
	height: '100%',
	padding: '8px 28px',
	gridTemplateRows: 'repeat(auto-fill, 280px)',

	'@media': {
		[`(width <= 850px)`]: {
			gridTemplateColumns: '1fr',
		},
		[`(850px < width <= 1250px)`]: {
			gridTemplateColumns: '1fr 1fr',
		},
		[`(1250px < width)`]: {
			gridTemplateColumns: '1fr 1fr 1fr',
		},
	},
})

export const graphDivider = style({
	borderBottom: vars.border.dividerWeak,

	'@media': {
		[`(width <= 850px)`]: {
			selectors: {
				'&:nth-child(1n + 1):nth-last-child(-n + 1)': {
					borderBottom: 'none',
				},
				'&:nth-child(1n + 1):nth-last-child(-n + 1) ~ &': {
					borderBottom: 'none',
				},
			},
		},
		[`(850px < width <= 1250px)`]: {
			selectors: {
				'&:nth-child(2n + 1):nth-last-child(-n + 2)': {
					borderBottom: 'none',
				},
				'&:nth-child(2n + 1):nth-last-child(-n + 2) ~ &': {
					borderBottom: 'none',
				},
			},
		},
		[`(1250px < width)`]: {
			selectors: {
				'&:nth-child(3n + 1):nth-last-child(-n + 3)': {
					borderBottom: 'none',
				},
				'&:nth-child(3n + 1):nth-last-child(-n + 3) ~ &': {
					borderBottom: 'none',
				},
			},
		},
	},
})

globalStyle(`${menuButton} > div`, {
	width: '100%',
})
