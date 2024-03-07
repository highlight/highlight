import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

import { colors } from '../../css/colors'
import { themeVars } from '../../css/theme.css'

export const GRAB_HANDLE_HEIGHT = 20

export const pageWrapper = style({
	width: '100%',
	height: '100%',
	position: 'relative',
})

export const controlBarButton = style({
	boxShadow: 'none',
})

export const tabText = style({
	display: 'flex',
})

export const handle = style({
	height: GRAB_HANDLE_HEIGHT,
	width: '100%',
	position: 'absolute',
	top: -GRAB_HANDLE_HEIGHT / 2,
})

export const grabbable = style({
	cursor: 'grab',
	selectors: {
		'&:active': {
			cursor: 'grabbing',
		},
	},
})

export const handleLine = style({
	backgroundColor: colors.n6,
	height: 1,
	width: '100%',
	position: 'relative',
	top: GRAB_HANDLE_HEIGHT / 2,
})

export const controlBarVariants = recipe({
	base: {
		background: 'none',
		borderRadius: 0,
		borderBottom: `none`,
		boxShadow: 'none',
		selectors: {
			'&:focus:enabled, &:active:enabled, &:hover:enabled': {
				background: 'none',
				boxShadow: 'none',
				borderRadius: 0,
				color: colors.n11,
			},
		},
	},
	variants: {
		selected: {
			true: {
				color: colors.p9,
			},
			false: {
				color: colors.n11,
			},
		},
	},

	defaultVariants: {
		selected: false,
	},
})

export const controlBarBottomVariants = recipe({
	base: {
		borderRadius: '2px 2px 0px 0px',
		height: 2,
	},
	variants: {
		selected: {
			true: {
				backgroundColor: colors.p9,
			},
		},
		hovered: {
			true: {
				backgroundColor:
					themeVars.interactive.outline.secondary.enabled,
			},
		},
	},
	compoundVariants: [
		{
			variants: { hovered: true, selected: true },
			style: {
				backgroundColor: colors.p9,
			},
		},
	],
})
