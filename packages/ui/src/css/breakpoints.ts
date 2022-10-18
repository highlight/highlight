export const breakpointNames = ['mobile', 'tablet', 'desktop', 'wide'] as const

export const breakpoints = {
	mobile: '0px',
	tablet: '740px',
	desktop: '992px',
	wide: '1200px',
} as const

export type Breakpoint = keyof typeof breakpoints
