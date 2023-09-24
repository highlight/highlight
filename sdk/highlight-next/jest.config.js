/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		// '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
		// '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
			},
		],
	},
	preset: 'ts-jest',
	testEnvironment: 'node',
}
