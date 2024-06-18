import { Maybe, Project, Workspace } from '@graph/schemas'
import { createContext } from '@util/context/context'

/**
 * Provides data about the current application and all applications the admin has access to.
 */
interface ApplicationContext {
	loading: boolean
	currentProject?: Project
	allProjects: Maybe<
		Maybe<
			{
				__typename?: 'Project' | undefined
			} & Pick<Project, 'id' | 'name'>
		>[]
	>
	currentWorkspace?: Maybe<
		{ __typename?: 'Workspace' } & Pick<
			Workspace,
			'id' | 'name' | 'cloudflare_proxy'
		>
	>
	workspaces: Maybe<
		{ __typename?: 'Workspace' } & Pick<Workspace, 'id' | 'name'>
	>[]
}

export const [useApplicationContext, ApplicationContextProvider] =
	createContext<ApplicationContext>('Application')
