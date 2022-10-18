import { Sprinkles } from './sprinkles.css'
import { vars } from './theme.css'

const borderWidths = {
	small: '1px',
	medium: '2px',
	large: '4px',
}

// Tried to create dynamically but lost types with the `${color}${width}` keys.
export const borders = {
	black: `${vars.color.black} solid ${borderWidths.small}`,
	blackMedium: `${vars.color.black} solid ${borderWidths.medium}`,
	blackLarge: `${vars.color.black} solid ${borderWidths.large}`,

	neutral: `${vars.color.neutral200} solid ${borderWidths.small}`,
	neutralMedium: `${vars.color.neutral200} solid ${borderWidths.medium}`,
	neutralLarge: `${vars.color.neutral200} solid ${borderWidths.large}`,

	purple: `${vars.color.purple700} solid ${borderWidths.small}`,
	purpleMedium: `${vars.color.purple700} solid ${borderWidths.medium}`,
	purpleLarge: `${vars.color.purple700} solid ${borderWidths.large}`,
}

export type BorderProps = {
	border?: Sprinkles['border']
	borderTop?: Sprinkles['borderTop']
	borderRight?: Sprinkles['borderRight']
	borderBottom?: Sprinkles['borderBottom']
	borderLeft?: Sprinkles['borderLeft']
}
