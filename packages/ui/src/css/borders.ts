import { BoxProps } from '../components/Box/Box'
import { colors } from './colors'
import { theme } from './theme'

type BorderKeys =
	| 'none'
	| 'interactivePrimaryEnabled'
	| 'interactivePrimaryHover'
	| 'interactivePrimaryPressed'
	| 'interactivePrimaryDisabled'
	| 'interactiveSecondaryEnabled'
	| 'interactiveSecondaryHover'
	| 'interactiveSecondaryPressed'
	| 'interactiveSecondaryDisabled'

type Borders = Record<BorderKeys, string>

export const borderWidths = {
	small: '1px',
	medium: '2px',
	large: '4px',
} as const

// Tried to create dynamically but lost types with the `${color}${width}` keys.
export const borders: Borders = {
	none: '0',

	// black: `${colors.black} solid ${borderWidths.small}`,
	// blackMedium: `${colors.black} solid ${borderWidths.medium}`,
	// blackLarge: `${colors.black} solid ${borderWidths.large}`,

	// neutral: `${colors.neutral200} solid ${borderWidths.small}`,
	// neutralMedium: `${colors.neutral200} solid ${borderWidths.medium}`,
	// neutralLarge: `${colors.neutral200} solid ${borderWidths.large}`,

	// neutralDark: `${colors.neutral300} solid ${borderWidths.small}`,
	// neutralDarkMedium: `${colors.neutral300} solid ${borderWidths.medium}`,
	// neutralDarkLarge: `${colors.neutral300} solid ${borderWidths.large}`,

	// purpleLight: `${colors.purple100} solid ${borderWidths.small}`,
	// purpleLightMedium: `${colors.purple100} solid ${borderWidths.medium}`,
	// purpleLightLarge: `${colors.purple100} solid ${borderWidths.large}`,

	// purple: `${colors.purple700} solid ${borderWidths.small}`,
	// purpleMedium: `${colors.purple700} solid ${borderWidths.medium}`,
	// purpleLarge: `${colors.purple700} solid ${borderWidths.large}`,

	interactivePrimaryEnabled: `${theme.interactive.outline.primary.enabled} solid ${borderWidths.small}`,
	interactivePrimaryHover: `${theme.interactive.outline.primary.hover} solid ${borderWidths.small}`,
	interactivePrimaryPressed: `${theme.interactive.outline.primary.pressed} solid ${borderWidths.small}`,
	interactivePrimaryDisabled: `${theme.interactive.outline.primary.disabled} solid ${borderWidths.small}`,

	interactiveSecondaryEnabled: `${theme.interactive.outline.secondary.enabled} solid ${borderWidths.small}`,
	interactiveSecondaryHover: `${theme.interactive.outline.secondary.hover} solid ${borderWidths.small}`,
	interactiveSecondaryPressed: `${theme.interactive.outline.secondary.pressed} solid ${borderWidths.small}`,
	interactiveSecondaryDisabled: `${theme.interactive.outline.secondary.disabled} solid ${borderWidths.small}`,
} as const

export interface BorderProps {
	border?: BoxProps['border']
	borderTop?: BoxProps['border']
	borderRight?: BoxProps['border']
	borderBottom?: BoxProps['border']
	borderLeft?: BoxProps['border']
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
