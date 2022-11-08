import { Props } from '../components/Box/Box'
import { colors } from './colors'

type BorderKeys =
	| 'none'
	| 'black'
	| 'blackMedium'
	| 'blackLarge'
	| 'neutral'
	| 'neutralMedium'
	| 'neutralLarge'
	| 'purple'
	| 'purpleMedium'
	| 'purpleLarge'

type Borders = Record<BorderKeys, string>

export const borderWidths = {
	small: '1px',
	medium: '2px',
	large: '4px',
} as const

// Tried to create dynamically but lost types with the `${color}${width}` keys.
export const borders: Borders = {
	none: '0',

	black: `${colors.black} solid ${borderWidths.small}`,
	blackMedium: `${colors.black} solid ${borderWidths.medium}`,
	blackLarge: `${colors.black} solid ${borderWidths.large}`,

	neutral: `${colors.neutral200} solid ${borderWidths.small}`,
	neutralMedium: `${colors.neutral200} solid ${borderWidths.medium}`,
	neutralLarge: `${colors.neutral200} solid ${borderWidths.large}`,

	purple: `${colors.purple700} solid ${borderWidths.small}`,
	purpleMedium: `${colors.purple700} solid ${borderWidths.medium}`,
	purpleLarge: `${colors.purple700} solid ${borderWidths.large}`,
} as const

export interface BorderProps {
	border?: Props['border']
	borderTop?: Props['border']
	borderRight?: Props['border']
	borderBottom?: Props['border']
	borderLeft?: Props['border']
}

export const borderRadii = {
	'3': '3px',
	'4': '4px',
	'5': '5px',
	'6': '6px',
	'8': '8px',
	'10': '10px',
	'12': '12px',
	'16': '16px',
	'23': '23px',
	round: '999px',
} as const
