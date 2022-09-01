import {
	dedupeEnvironments,
	DEFAULT_HIGHLIGHT_ENVIRONMENTS,
	EnvironmentSuggestion,
} from './AlertsUtils'

describe('dedupeEnvironments', () => {
	const CASES = [
		[[{ value: '', name: '' }], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS]],
		[
			[{ value: 'production', name: 'production' }],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS],
		],
		[
			[{ value: 'staging', name: 'staging' }],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS],
		],
		[
			[{ value: 'development', name: 'development' }],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS],
		],
		[
			[{ value: "jay's laptop", name: "jay's laptop" }],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS, "jay's laptop"],
		],
		[
			[
				{ value: "jay's laptop", name: "jay's laptop" },
				{ value: "john's phone", name: "john's phone" },
			],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS, "jay's laptop", "john's phone"],
		],
		[[], [...DEFAULT_HIGHLIGHT_ENVIRONMENTS]],
		[
			[
				{ value: 'z', name: 'z' },
				{ value: 'a', name: 'a' },
				{ value: 'b', name: 'b' },
				{ value: 'd', name: 'd' },
			],
			[...DEFAULT_HIGHLIGHT_ENVIRONMENTS, 'a', 'b', 'd', 'z'],
		],
	]

	it.each(CASES)(
		'should handle deduplicating the environment names',
		(environmentsFromApi, expected) => {
			const result = dedupeEnvironments(
				environmentsFromApi as EnvironmentSuggestion[],
			)

			;(expected as string[]).forEach((environment) => {
				expect(result.includes(environment)).toBe(true)
			})
			expect(result.length).toBe(result.length)
		},
	)
})
