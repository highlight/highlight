import { Maybe, Project } from '@graph/schemas'

export const getProjectPrefix = (project?: Maybe<Pick<Project, 'name'>>) =>
	project?.name.slice(0, 3).toUpperCase() || ''
