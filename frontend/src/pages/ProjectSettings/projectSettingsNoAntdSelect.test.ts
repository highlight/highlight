import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const frontendRoot = process.cwd().endsWith('/frontend')
	? process.cwd()
	: resolve(process.cwd(), 'frontend')

const projectSettingsFiles = [
	'ErrorFiltersForm/ErrorFiltersForm.tsx',
	'ErrorSettingsForm/ErrorSettingsForm.tsx',
	'ExcludedUsersForm/ExcludedUsersForm.tsx',
]

describe('ProjectSettings antd cleanup', () => {
	it('does not use the legacy antd Select wrapper in project settings forms', () => {
		for (const file of projectSettingsFiles) {
			const source = readFileSync(
				resolve(frontendRoot, 'src/pages/ProjectSettings', file),
				'utf8',
			)

			expect(source).not.toContain('@components/Select/Select')
		}
	})
})
