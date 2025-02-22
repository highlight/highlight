import { createGlobalTheme } from '@vanilla-extract/css'

export const themeVars = createGlobalTheme('.highlight-light-theme', {
	static: {
		surface: {
			nested: '#fdfcfd',
			default: '#ffffff',
			raised: '#f9f8f9',
			elevated: '#f4f2f4',
			scrim: 'rgba(26, 21, 35, 0.72)',
			sentiment: {
				good: '#ddf3e4',
				caution: '#ffecbc',
				bad: '#ffe5e5',
				informative: '#ede7fe',
				neutral: '#eeedef',
			},
		},
		content: {
			strong: '#1a1523',
			default: 'rgba(26, 21, 35, 0.72)',
			moderate: '#6f6e77',
			weak: 'rgba(111, 110, 119, 0.8)',
			sentiment: {
				good: '#18794e',
				caution: '#ad5700',
				bad: '#cd2b31',
				informative: '#6346af',
			},
		},
		divider: { strong: '#c8c7cb', default: '#dcdbdd', weak: '#ebe9eb' },
	},
	interactive: {
		fill: {
			primary: {
				enabled: '#744ed4',
				hover: '#6b48c7',
				pressed: '#6346af',
				disabled: 'rgba(116, 78, 212, 0.24)',
				content: {
					onEnabled: '#ffffff',
					onDisabled: 'rgba(32, 16, 77, 0.36)',
					text: '#6346af',
				},
			},
			secondary: {
				enabled: '#eeedef',
				hover: '#e9e8ea',
				pressed: '#e4e2e4',
				disabled: '#f4f2f4',
				content: {
					onEnabled: 'rgba(26, 21, 35, 0.72)',
					onDisabled: '#c8c7cb',
					text: '#6f6e77',
				},
			},
			bad: {
				enabled: '#e5484d',
				hover: '#dc3d43',
				pressed: '#cd2b31',
				disabled: 'rgba(229, 72, 77, 0.24)',
				content: {
					onEnabled: '#ffffff',
					onDisabled: 'rgba(56, 19, 22, 0.36)',
					text: '#cd2b31',
				},
			},
			caution: {
				enabled: '#ffb224',
				hover: '#ffa01c',
				pressed: '#ee9d2b',
				disabled: 'rgba(255, 178, 36, 0.24)',
				content: {
					onEnabled: '#4e2009',
					onDisabled: 'rgba(78, 32, 9, 0.36)',
					text: '#ad5700',
				},
			},
			positive: {
				enabled: '#30a46c',
				hover: '#299764',
				pressed: '#18794e',
				disabled: 'rgba(48, 164, 108, 0.24)',
				content: {
					onEnabled: '#ffffff',
					onDisabled: 'rgba(21, 50, 38, 0.36)',
					text: '#18794e',
				},
			},
		},
		outline: {
			primary: {
				enabled: '#d9cdf9',
				hover: '#c9b9f3',
				pressed: '#af98ec',
				disabled: '#f4f0ff',
			},
			secondary: {
				enabled: '#dcdbdd',
				hover: '#c8c7cb',
				pressed: '#c8c7cb',
				disabled: '#f4f2f4',
			},
		},
		overlay: {
			primary: {
				enabled: 'rgba(237, 231, 254, 0.0)',
				hover: '#ede7fe',
				pressed: '#e7defc',
				disabled: 'rgba(237, 231, 254, 0.0)',
			},
			secondary: {
				enabled: 'rgba(238, 237, 239, 0.0)',
				hover: 'rgba(22, 22, 24, 0.05)',
				pressed: '#e9e8ea',
				disabled: 'rgba(238, 237, 239, 0.0)',
				selected: {
					default: 'rgba(238, 237, 239, 0.64)',
					hover: 'rgba(238, 237, 239, 0.84)',
				},
			},
		},
	},
})
