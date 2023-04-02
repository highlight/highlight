import { useAuthContext } from '@authentication/AuthContext'
import Button from '@components/Button/Button/Button'
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import Group from '@components/Group/Group'
import { MiniWorkspaceIcon } from '@components/Header/WorkspaceDropdown/WorkspaceDropdown'
import PopoverMenu from '@components/PopoverMenu/PopoverMenu'
import { useProjectId } from '@hooks/useProjectId'
import SvgArrowRightIcon from '@icons/ArrowRightIcon'
import SvgBriefcase2Icon from '@icons/Briefcase2Icon'
import SvgSwitch2Icon from '@icons/Switch2Icon'
import { useApplicationContext } from '@routers/ProjectRouter/context/ApplicationContext'
import {
	DEMO_PROJECT_NAME,
	DEMO_WORKSPACE_NAME,
} from '@util/constants/constants'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import SvgPlusIcon from '../../../../static/PlusIcon'
import SvgSettingsIcon from '../../../../static/SettingsIcon'
import styles from './ApplicationPicker.module.scss'

const ApplicationPicker = () => {
	const { allProjects, currentProject, currentWorkspace } =
		useApplicationContext()
	const { workspace_id, project_id } = useParams<{
		workspace_id: string
		project_id: string
	}>()
	const { projectId: projectIdRemapped } = useProjectId()
	const { isLoggedIn } = useAuthContext()
	const isWorkspaceLevel = workspace_id !== undefined
	const navigate = useNavigate()
	const { pathname } = useLocation()
	const isInDemoProject =
		projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID

	const projectOptions = [
		...(allProjects
			? allProjects.map((project) => ({
					value: project?.id || '',
					displayValue: (
						<div>
							<span className={styles.existingProjectOption}>
								<MiniWorkspaceIcon
									className={styles.workspaceIcon}
									projectName={
										!isLoggedIn &&
										projectIdRemapped ===
											DEMO_WORKSPACE_PROXY_APPLICATION_ID
											? DEMO_PROJECT_NAME
											: project?.name || ''
									}
								/>
								<span>
									{!isLoggedIn &&
									projectIdRemapped ===
										DEMO_WORKSPACE_PROXY_APPLICATION_ID
										? DEMO_PROJECT_NAME
										: project?.name || ''}
								</span>
							</span>
						</div>
					),
					id: project?.id || '',
			  }))
			: []),
	]

	const headerDisplayValue = isWorkspaceLevel
		? 'Workspace'
		: !isLoggedIn &&
		  projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID
		? DEMO_PROJECT_NAME
		: currentProject?.name
	const subHeaderDisplayValue =
		!isLoggedIn && projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID
			? DEMO_WORKSPACE_NAME
			: currentWorkspace?.name

	return (
		<div className={styles.applicationPicker}>
			<div className={styles.headerContainer}>
				<h2>{headerDisplayValue}</h2>
				<span className={styles.subTitle}>{subHeaderDisplayValue}</span>
			</div>
			<Group>
				<div>
					{!isInDemoProject && (
						<PopoverMenu
							placement="bottomLeft"
							menuItems={[
								{
									displayName: 'Create a New Project',
									icon: <SvgPlusIcon />,
									action: () => {
										navigate(
											`/w/${currentWorkspace?.id}/new`,
										)
									},
								},
								{
									displayName: 'Project Settings',
									icon: <SvgBriefcase2Icon />,
									action: () => {
										navigate(`/${project_id}/settings`)
									},
								},
								{
									displayName: 'Switch Workspace',
									icon: <SvgArrowRightIcon />,
									action: () => {
										navigate(`/switch`)
									},
								},
								{
									displayName: 'Workspace Settings',
									icon: <SvgSettingsIcon />,
									action: () => {
										navigate(
											`/w/${currentWorkspace?.id}/team`,
										)
									},
								},
							]}
							buttonTrackingId="ApplicationPickerSettings"
							buttonContentsOverride={
								<Button
									trackingId="ApplicationPickerSettings"
									type="text"
									iconButton
								>
									<SvgSettingsIcon />
								</Button>
							}
						/>
					)}
				</div>
				{projectOptions.length > 0 && (
					<div>
						<PopoverMenu
							placement="bottomLeft"
							menuItems={projectOptions.map((project) => ({
								displayName: project.displayValue,
								action: () => {
									const path = isWorkspaceLevel
										? ''
										: pathname
												.split('/')
												.filter(
													(token) => token.length,
												)[1]
									navigate(`/${project.id}/${path}`)
								},
								icon: null,
								active: project?.id === project_id,
							}))}
							buttonTrackingId="ApplicationPickerSettings"
							buttonContentsOverride={
								isWorkspaceLevel ? (
									<Button
										trackingId="ApplicationPickerSettings"
										type="text"
										iconButton
										className={styles.backToProjectButton}
									>
										<SvgSwitch2Icon />
										<span>Back to Project</span>
									</Button>
								) : (
									<Button
										trackingId="ApplicationPickerSettings"
										type="text"
										iconButton
									>
										<SvgSwitch2Icon />
									</Button>
								)
							}
						/>
					</div>
				)}
			</Group>
		</div>
	)
}

export default ApplicationPicker
