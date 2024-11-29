import { useLocation } from 'react-router-dom'

export type SettingGroups = 'account' | 'project'

export type WorkspaceSettingsTab =
	| 'team'
	| 'settings'
	| 'current-plan'
	| 'upgrade-plan'
	| 'harold-ai'
	| 'integrations'

export const isSettingsPath = (path: string[]) => {
	const settingsPaths: (WorkspaceSettingsTab | SettingGroups)[] = [
		'settings',
		'account',
		'team',
		'current-plan',
		'upgrade-plan',
		'harold-ai',
		'integrations',
	]
	return settingsPaths.some(
		(settingsPath) => path.indexOf(settingsPath) !== -1,
	)
}

export function useIsSettingsPath() {
	const { pathname } = useLocation()
	const parts = pathname.split('/')
	const isSettings = isSettingsPath(parts)

	return { isSettings }
}
