// TODO: Implement a shared interface that can be reused across all icons.
// Should include variations for size that match up with text sizes. Also
// consider housing actual SVG somewhere else and generating .tsx files so icons
// can be easily extended by dropping in from Figma.
export type IconProps = {
	color?: string // TODO: Make this a value from vars.color
	size?: number
}
