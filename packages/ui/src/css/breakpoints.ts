export const breakpoints = {
	mobile: '0px',
	tablet: '740px',
	desktop: '992px',
	wide: '1200px',
} as const

export const mediaQueries = {
	mobile: {},
	tablet: {
		'@media': `screen and (min-width: ${breakpoints.tablet})`,
	},
	desktop: {
		'@media': `screen and (min-width: ${breakpoints.desktop})`,
	},
	wide: { '@media': `screen and (min-width: ${breakpoints.wide})` },
} as const
