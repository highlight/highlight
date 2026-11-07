import Select from '@components/Select/Select'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import React, { useEffect, useMemo, useState } from 'react'

import { Maybe, Project } from '@/graph/generated/schemas'
import { useLocalStorageProjectId } from '@/hooks/useProjectId'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

export interface ProjectSelectOption {
	displayValue: string
	value: string
	id: string
}

export interface ProjectSelectionState {
	options: ProjectSelectOption[]
	selectedProjectId: string
	selectedProject: ProjectSelectOption | undefined
	setSelectedProjectId: (projectId: string) => void
}

const buildProjectSelectOptions = (
	allProjects?: Maybe<Maybe<Pick<Project, 'id' | 'name'>>[]>,
): ProjectSelectOption[] => {
	if (!allProjects) {
		return []
	}
	return allProjects
		.filter((project): project is Pick<Project, 'id' | 'name'> =>
			Boolean(project?.id),
		)
		.map((project) => ({
			displayValue: project.name,
			value: project.id,
			id: project.id,
		}))
}

interface InitialProjectSeed {
	options: ProjectSelectOption[]
	storedProjectId?: string | number
	currentProjectId?: string
}

const resolveInitialProjectId = (seed: InitialProjectSeed): string => {
	const candidateId = seed.storedProjectId
		? String(seed.storedProjectId)
		: ''
	const hasStoredMatch = seed.options.some((opt) => opt.value === candidateId)
	if (hasStoredMatch) {
		return candidateId
	}
	return seed.currentProjectId || seed.options[0]?.value || ''
}

const extractProjectIdValue = (
	nextValue: string | ProjectSelectOption,
): string => {
	if (typeof nextValue === 'string') {
		return nextValue
	}
	return nextValue?.value || ''
}

const findMatchingOption = (
	options: ProjectSelectOption[],
	selectedId: string,
): ProjectSelectOption | undefined => {
	return options.find((opt) => opt.value === selectedId) || options[0]
}

/**
 * Resolves the workspace's project list and pre-selects the last visited project
 * from localStorage (falling back to the first available workspace project).
 */
export const useIntegrationProjectSelection = (): ProjectSelectionState => {
	const { projectId: localStorageProjectId, setProjectId } =
		useLocalStorageProjectId()
	const { allProjects, currentProject } = useApplicationContext()

	const options = useMemo(
		() => buildProjectSelectOptions(allProjects),
		[allProjects],
	)

	const defaultProjectId = useMemo(
		() =>
			resolveInitialProjectId({
				options,
				storedProjectId: localStorageProjectId,
				currentProjectId: currentProject?.id,
			}),
		[currentProject?.id, localStorageProjectId, options],
	)

	const [selectedProjectId, setSelectedProjectIdState] =
		useState<string>(defaultProjectId)

	useEffect(() => {
		if (!selectedProjectId && defaultProjectId) {
			setSelectedProjectIdState(defaultProjectId)
		}
	}, [defaultProjectId, selectedProjectId])

	const setSelectedProjectId = (nextValue: string | ProjectSelectOption) => {
		const resolvedId = extractProjectIdValue(nextValue)
		setSelectedProjectIdState(resolvedId)
		if (resolvedId) {
			setProjectId(resolvedId)
		}
	}

	const selectedProject = useMemo(
		() => findMatchingOption(options, selectedProjectId),
		[options, selectedProjectId],
	)

	return {
		options,
		selectedProjectId: selectedProject?.value || selectedProjectId,
		selectedProject,
		setSelectedProjectId,
	}
}

export interface ProjectSelectionProps {
	state: ProjectSelectionState
}

/**
 * Renders the Highlight project selector dropdown for project-scoped integrations.
 */
export const ProjectSelection: React.FC<ProjectSelectionProps> = ({
	state,
}) => {
	if (state.options.length === 0) {
		return null
	}

	return (
		<Box mb="16" style={{ maxWidth: 280 }}>
			<Stack gap="8">
				<Text
					size="xSmall"
					weight="medium"
					color="secondaryContentText"
				>
					Project
				</Text>
				<Select
					aria-label="Project"
					className="w-full"
					value={state.selectedProject?.value}
					onChange={state.setSelectedProjectId}
					options={state.options}
					placeholder="Select a project"
				/>
			</Stack>
		</Box>
	)
}

export default ProjectSelection
