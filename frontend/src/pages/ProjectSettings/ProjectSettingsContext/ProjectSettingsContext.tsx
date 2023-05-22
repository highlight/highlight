import { GetProjectSettingsQuery } from '@/graph/generated/operations'
import { createContext } from '@/util/context/context'

export const [useProjectSettingsContext, ProjectSettingsContextProvider] =
	createContext<{
		allProjectSettings: GetProjectSettingsQuery | undefined
		setAllProjectSettings: React.Dispatch<
			React.SetStateAction<GetProjectSettingsQuery | undefined>
		>
		loading: boolean
	}>('ProjectSettingsContext')
