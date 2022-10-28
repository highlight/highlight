// TODO: The keys of this object are converted to numbers when we create the
// type declarations. We could use numbers as keys, but then our props need to
// be passed as numbers (gap={4} instead of gap="4"), which breaks intellisense.
//
// TODO: Check out internal packages as an alternative that eliminates the need
// to build the referenced project: https://turbo.build/blog/you-might-not-need-typescript-project-references
export const spaces = {
	'0': '0',
	'2': '2px',
	'4': '4px',
	'6': '6px',
	'8': '8px',
	'10': '10px',
	'12': '12px',
	'16': '16px',
	'20': '20px',
	'24': '24px',
	'28': '28px',
	'32': '32px',
} as const
