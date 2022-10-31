import { Props } from '../components/Box/Box'
import { vars } from './vars'

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

// Tried to create dynamically but lost types with the `${color}${width}` keys.
export const borders: Borders = {
	none: '0',

	black: `${vars.color.black} solid ${vars.borderWidth.small}`,
	blackMedium: `${vars.color.black} solid ${vars.borderWidth.medium}`,
	blackLarge: `${vars.color.black} solid ${vars.borderWidth.large}`,

	neutral: `${vars.color.neutral200} solid ${vars.borderWidth.small}`,
	neutralMedium: `${vars.color.neutral200} solid ${vars.borderWidth.medium}`,
	neutralLarge: `${vars.color.neutral200} solid ${vars.borderWidth.large}`,

	purple: `${vars.color.purple700} solid ${vars.borderWidth.small}`,
	purpleMedium: `${vars.color.purple700} solid ${vars.borderWidth.medium}`,
	purpleLarge: `${vars.color.purple700} solid ${vars.borderWidth.large}`,
}

export interface BorderProps {
	border?: Props['border']
	borderTop?: Props['border']
	borderRight?: Props['border']
	borderBottom?: Props['border']
	borderLeft?: Props['border']
}
