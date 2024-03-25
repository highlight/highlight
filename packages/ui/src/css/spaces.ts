export const spaces = {
	'0': '0',
	'1': '1px',
	'3': '3px',
	'2': '2px',
	'4': '4px',
	'6': '6px',
	'7': '7px',
	'8': '8px',
	'9': '9px',
	'10': '10px',
	'12': '12px',
	'16': '16px',
	'20': '20px',
	'24': '24px',
	'28': '28px',
	'32': '32px',
	'36': '36px',
	'40': '40px',
	'44': '44px',
	'48': '48px',
} as const

export type Space = keyof typeof spaces
export const spaceNames = Object.keys(spaces) as readonly Space[]
