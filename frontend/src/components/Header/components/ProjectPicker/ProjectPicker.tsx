import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { linkStyle } from '@components/Header/styles.css'
import {
	Box,
	IconSolidArrowSmLeft,
	IconSolidBriefcase,
	IconSolidCheck,
	IconSolidCog,
	IconSolidPlusSm,
	Menu,
	Text,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import { generateRandomColor } from '@util/color'
import { DEMO_PROJECT_NAME } from '@util/constants/constants'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
	const isWorkspaceLevel = workspace_id !== undefined
	const navigate = useNavigate()
	const isInDemoProject =
		projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID

	const projectOptions = allProjects
		? allProjects.map((project) => {
				const isSelected = project_id === project?.id
				return (
					<Menu.Item
						key={project?.id}
						onClick={() => {
							navigate(`/${project?.id}/sessions`)
						}}
						style={
							isSelected
								? {
										backgroundColor: vars.color.n2,
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
								{isSelected && <IconSolidCheck size={14} />}
							</Box>
						</Box>
					</Menu.Item>
				)
		  })
		: []

	const headerDisplayValue = isWorkspaceLevel
		? 'Back to Project'
		: isInDemoProject
		? DEMO_PROJECT_NAME
		: currentProject?.name

	return (
		<div>
			<div>
				<Menu>
					<Menu.Button
						kind="secondary"
						emphasis="high"
						size="small"
						iconLeft={
							isWorkspaceLevel ? (
								<IconSolidArrowSmLeft size={14} />
							) : (
								<IconSolidBriefcase size={14} />
							)
						}
					>
						<Text lines="1">{headerDisplayValue}</Text>
					</Menu.Button>
					<Menu.List>
						{projectOptions}
						{project_id && project_id !== '0' && (
							<>
								<Menu.Divider />
								<Link
									to={`/w/${currentWorkspace?.id}/new`}
									className={linkStyle}
								>
									<Menu.Item>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
										>
											<IconSolidPlusSm
												size={14}
												color={vars.color.n9}
											/>
											Create new project
										</Box>
									</Menu.Item>
								</Link>
								<Link
									to={`/${project_id}/settings`}
									className={linkStyle}
								>
									<Menu.Item>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
										>
											<IconSolidCog
												size={14}
												color={vars.color.n9}
											/>
											Project settings
										</Box>
									</Menu.Item>
								</Link>
							</>
						)}
					</Menu.List>
				</Menu>
			</div>
		</div>
	)
}

export default ProjectPicker
