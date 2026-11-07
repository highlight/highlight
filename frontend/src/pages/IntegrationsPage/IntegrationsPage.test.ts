import { act, renderHook } from '@testing-library/react-hooks'
import { describe, expect, it, vi } from 'vitest'

import { isSettingsPath } from '@/hooks/useIsSettingsPath'
import * as projectIdHooks from '@/hooks/useProjectId'
import { useIntegrationProjectSelection } from '@/pages/IntegrationsPage/components/common/ProjectSelection'
import INTEGRATIONS, {
	resolveIntegrationExternalDomain,
	SLACK_INTEGRATION,
	VERCEL_INTEGRATION,
	ZAPIER_INTEGRATION,
} from '@/pages/IntegrationsPage/Integrations'
import {
	resolveDefaultIntegrationKey,
	resolveIntegrationBasePath,
} from '@/pages/IntegrationsPage/IntegrationsPage'
import { isIntegrationVisibleForWorkspace } from '@/pages/IntegrationsPage/useWorkspaceIntegrations'
import * as appContext from '@/routers/AppRouter/context/ApplicationContext'

vi.mock('@/hooks/useProjectId', () => ({
	useLocalStorageProjectId: vi.fn(),
	useProjectId: vi.fn(() => ({ projectId: '1' })),
}))

vi.mock('@/routers/AppRouter/context/ApplicationContext', () => ({
	useApplicationContext: vi.fn(),
}))

describe('Workspace Integrations page routing and domain rules', () => {
	it('recognizes workspace integrations URLs as settings paths', () => {
		expect(isSettingsPath(['', 'w', '1', 'integrations'])).toBe(true)
		expect(isSettingsPath(['', 'w', '1', 'integrations', 'vercel'])).toBe(
			true,
		)
	})

	it('resolves clean vendor domain names and documentation notes for integrations', () => {
		expect(resolveIntegrationExternalDomain(VERCEL_INTEGRATION)).toBe(
			'vercel.com',
		)
		expect(resolveIntegrationExternalDomain(SLACK_INTEGRATION)).toBe(
			'slack.com',
		)
		expect(INTEGRATIONS.every((item) => Boolean(item.docs))).toBe(true)
		expect(
			INTEGRATIONS.every(
				(item) => (item.overviewNotes?.length ?? 0) > 0,
			),
		).toBe(true)
	})

	it('filters admin-restricted integrations based on workspace privileges', () => {
		expect(
			isIntegrationVisibleForWorkspace(ZAPIER_INTEGRATION, {
				workspaceId: '10',
				isHighlightAdmin: false,
			}),
		).toBe(false)
		expect(
			isIntegrationVisibleForWorkspace(ZAPIER_INTEGRATION, {
				workspaceId: '10',
				isHighlightAdmin: true,
			}),
		).toBe(true)
		expect(
			isIntegrationVisibleForWorkspace(SLACK_INTEGRATION, {
				workspaceId: '10',
				isHighlightAdmin: false,
			}),
		).toBe(true)
	})

	it('prioritizes enabled integrations when selecting the default detail route', () => {
		expect(
			resolveDefaultIntegrationKey(
				[SLACK_INTEGRATION],
				[VERCEL_INTEGRATION],
			),
		).toBe('slack')
		expect(resolveDefaultIntegrationKey([], [VERCEL_INTEGRATION])).toBe(
			'vercel',
		)
		expect(
			resolveIntegrationBasePath({ workspaceId: '42', projectId: '1' }),
		).toBe('/w/42/integrations')
	})

	it('pre-selects the last visited project from localStorage and updates selection', () => {
		const setProjectIdMock = vi.fn()
		vi.mocked(projectIdHooks.useLocalStorageProjectId).mockReturnValue({
			projectId: '2',
			setProjectId: setProjectIdMock,
		} as any)
		vi.mocked(appContext.useApplicationContext).mockReturnValue({
			allProjects: [
				{ id: '1', name: 'Frontend App' },
				{ id: '2', name: 'Backend Service' },
			],
			currentProject: { id: '1', name: 'Frontend App' },
			currentWorkspace: { id: '10', name: 'Acme' },
		} as any)

		const { result } = renderHook(() => useIntegrationProjectSelection())
		expect(result.current.selectedProjectId).toBe('2')
		expect(result.current.selectedProject?.displayValue).toBe(
			'Backend Service',
		)

		act(() => {
			result.current.setSelectedProjectId('1')
		})
		expect(result.current.selectedProjectId).toBe('1')
		expect(setProjectIdMock).toHaveBeenCalledWith('1')
	})
})
