import { colors } from '@highlight-run/ui/src/css/colors'
import { ERROR_FEED_SCROLLBAR_WIDTH } from '@pages/ErrorsV2/ErrorFeed/ErrorFeed.css'
import { ERROR_FEED_LEFT_PANEL_WIDTH } from '@pages/ErrorsV2/SearchPanel/SearchPanel.css'
import { style } from '@vanilla-extract/css'

export const ERROR_CARD_PX = 12

export const errorCardTitle = style({
	height: 20,
	width:
		ERROR_FEED_LEFT_PANEL_WIDTH -
		2 * ERROR_CARD_PX -
		ERROR_FEED_SCROLLBAR_WIDTH,
})

export const errorCardTitleText = style({
	overflowX: 'hidden',
})

export const errorCard = style({
	selectors: {
		'&:hover': {
			background: colors.neutral100,
		},
	},
})

export const errorCardSelected = style({
	background: colors.neutral200,
	selectors: {
		'&:hover': {
			backgroundColor: colors.neutral200,
		},
	},
})
