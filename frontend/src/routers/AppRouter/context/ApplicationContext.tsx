import { Maybe, Project, Workspace } from '@graph/schemas'
import { createContext } from '@util/context/context'

import { ProjectFragment } from '@/graph/generated/operations'

/**
 * Provides data about the current application and all applications the admin has access to.
 */
interface ApplicationContext {
	loading: boolean
	currentProject?: Omit<Project, 'workspace'>
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
			| 'id'
			| 'name'
			| 'retention_period'
			| 'errors_retention_period'
			| 'cloudflare_proxy'
		>
	>
	workspaces: Maybe<
		{ __typename?: 'Workspace' } & Pick<Workspace, 'id' | 'name'>
	>[]
	joinableWorkspaces: Maybe<
		{ __typename?: 'Workspace' } & Pick<Workspace, 'id' | 'name'> & {
				projects: Array<
					Maybe<{ __typename?: 'Project' } & ProjectFragment>
				>
			}
	>[]
}

export const [useApplicationContext, ApplicationContextProvider] =
	createContext<ApplicationContext>('Application')
