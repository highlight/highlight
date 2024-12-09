import {
	dedupeEnvironments,
	DEFAULT_HIGHLIGHT_ENVIRONMENTS,
} from './AlertsUtils'

describe('dedupeEnvironments', () => {
	const CASES = [
		[[], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS]],
		[['production'], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS]],
		[['staging'], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS]],
		[['development'], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS]],
		[["jay's laptop"], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS, "jay's laptop"]],
		[
			["jay's laptop", "john's phone"],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS, "jay's laptop", "john's phone"],
		],
		[[], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS]],
		[
			['z', 'a', 'b', 'd'],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS, 'a', 'b', 'd', 'z'],
		],
	]

	it.each(CASES)(
		'should handle deduplicating the environment names',
		(environmentsFromApi, expected) => {
			const result = dedupeEnvironments(environmentsFromApi)

			;(expected as string[]).forEach((environment) => {
				expect(result.includes(environment)).toBe(true)
			})
			expect(result.length).toBe(result.length)
		},
	)
})
