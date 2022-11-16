import { useAuthContext } from '@authentication/AuthContext'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	Box,
	IconBriefcase,
	IconCheck,
	IconDotsHorizontal,
	IconPlusSm,
	Menu,
	Text,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import { generateRandomColor } from '@util/color'
import { DEMO_PROJECT_NAME } from '@util/constants/constants'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { useApplicationContext } from '../../../../routers/OrgRouter/ApplicationContext'

const ProjectPicker = () => {
	const { allProjects, currentProject, currentWorkspace } =
		useApplicationContext()
	const { workspace_id, project_id } = useParams<{
		workspace_id: string
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const { isLoggedIn } = useAuthContext()
	const isWorkspaceLevel = workspace_id !== undefined
	const history = useHistory()
	const { pathname } = useLocation()
	const isInDemoProject =
		projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID

	const projectOptions = allProjects
		? allProjects.map((project) => {
				const isSelected = project_id === project?.id
				return (
					<Menu.Item
						key={project?.id}
						onClick={() => {
							history.push(`/${project?.id}/home`)
						}}
						style={
							isSelected
								? {
										backgroundColor: vars.color.neutral100,
								  }
								: undefined
						}
					>
						<Box display="flex" alignItems="center" gap="4">
							<Box
								margin="4"
								style={{
									height: 8,
									width: 8,
									backgroundColor: generateRandomColor(
										project?.name ?? '',
									),
									borderRadius: '50%',
								}}
							></Box>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								width="full"
							>
								<Text lines="1">{project?.name ?? ''}</Text>
								{isSelected && <IconCheck size={14} />}
							</Box>
						</Box>
					</Menu.Item>
				)
		  })
		: []

	const headerDisplayValue = isWorkspaceLevel
		? currentWorkspace?.name
		: !isLoggedIn &&
		  projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID
		? DEMO_PROJECT_NAME
		: currentProject?.name

	return (
		<div>
			<div>
				<Menu>
					<Menu.Button kind="secondary" style={{ maxWidth: 200 }}>
						<IconBriefcase
							size="14"
							color={vars.color.neutral700}
						/>
						test
					</Menu.Button>
					<Menu.List>
						{projectOptions}
						<Menu.Divider />
						<Menu.Item
							onClick={() => {
								history.push(`/w/${currentWorkspace?.id}/new`)
							}}
						>
							<Box display="flex" alignItems="center" gap="4">
								<IconPlusSm size="14" />
								Create new project
							</Box>
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								history.push(`/${project_id}/settings`)
							}}
						>
							<Box display="flex" alignItems="center" gap="4">
								<IconDotsHorizontal size="14" />
								Project settings
							</Box>
						</Menu.Item>
					</Menu.List>
				</Menu>
			</div>
		</div>
	)
}

export default ProjectPicker
