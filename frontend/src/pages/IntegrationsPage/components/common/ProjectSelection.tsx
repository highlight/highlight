import { Project } from '@/graph/generated/schemas'
import { useLocalStorageProjectId } from '@/hooks/useProjectId'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import Select from '@components/Select/Select'
import { useMemo, useState } from 'react'
import { Text } from '@highlight-run/ui/components'

export const useIntergationProjectConfig = () => {
	const { projectId: localStorageProjectId } = useLocalStorageProjectId()
	const { allProjects, currentWorkspace } = useApplicationContext()
	const options = useMemo(() => {
		return (allProjects || [])
			.filter((project): project is Project => project !== null) // Narrow the type
			.map((project) => ({
				displayValue: project.name,
				value: project.id,
				id: project.id,
			}))
	}, [allProjects])
	const currentOption = useMemo(() => {
		return (
			options.find((option) => option.value == localStorageProjectId) ??
			options?.[0]
		)
	}, [options, localStorageProjectId])

	const [selectedProject, setSelectedProject] = useState(
		currentOption || null,
	)

	return {
		options: options,
		selectedProject: selectedProject,
		setSelectedProject: setSelectedProject,
		currentWorkspace,
	}
}

export default function ProjectSelection({
	options,
	selectedProject,
	setSelectedProject,
}: any) {
	return (
		<div className="max-w-[250px]">
			<Text cssClass="gray-400 my-2" color="informative">
				Project
			</Text>
			<Select
				aria-label="Project"
				className="w-full"
				value={selectedProject}
				onChange={setSelectedProject}
				options={options}
				placeholder="Project Id"
			/>
		</div>
	)
}
