import { BoxProps } from '../components/Box/Box'
import { themeVars } from './theme.css'

type BorderKeys =
	| 'none'
	| 'primary'
	| 'primaryHover'
	| 'primaryPressed'
	| 'primaryDisabled'
	| 'error'
	| 'secondary'
	| 'secondaryHover'
	| 'secondaryPressed'
	| 'secondaryDisabled'
	| 'secondaryInner'
	| 'divider'
	| 'dividerWeak'
	| 'dividerStrong'

type Borders = Record<BorderKeys, string>

export const borderWidths = {
	small: '1px',
	medium: '2px',
	large: '4px',
} as const

// Tried to create dynamically but lost types with the `${color}${width}` keys.
export const borders: Borders = {
	none: '0',

	primary: `${themeVars.interactive.outline.primary.enabled} solid ${borderWidths.small}`,
	primaryHover: `${themeVars.interactive.outline.primary.hover} solid ${borderWidths.small}`,
	primaryPressed: `${themeVars.interactive.outline.primary.pressed} solid ${borderWidths.small}`,
	primaryDisabled: `${themeVars.interactive.outline.primary.disabled} solid ${borderWidths.small}`,

	error: `${themeVars.interactive.fill.bad.enabled} solid ${borderWidths.small}`,
	secondary: `${themeVars.interactive.outline.secondary.enabled} solid ${borderWidths.small}`,
	secondaryHover: `${themeVars.interactive.outline.secondary.hover} solid ${borderWidths.small}`,
	secondaryPressed: `${themeVars.interactive.outline.secondary.pressed} solid ${borderWidths.small}`,
	secondaryDisabled: `${themeVars.interactive.outline.secondary.disabled} solid ${borderWidths.small}`,
	secondaryInner: `0 -1px 0 0 rgba(0, 0, 0, 0.1) inset`,

	divider: `${themeVars.static.divider.default} solid ${borderWidths.small}`,
	dividerWeak: `${themeVars.static.divider.weak} solid ${borderWidths.small}`,
	dividerStrong: `${themeVars.static.divider.strong} solid ${borderWidths.small}`,
} as const

export interface BorderProps {
	border?: BoxProps['border']
	borderTop?: BoxProps['border']
	borderRight?: BoxProps['border']
	borderBottom?: BoxProps['border']
	borderLeft?: BoxProps['border']
}

export const borderRadii = {
	'0': '0',
	'2': '2px',
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
	inherit: 'inherit',
} as const
