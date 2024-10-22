import EnterpriseFeatureButton from '@components/Billing/EnterpriseFeatureButton'
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
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { SIGN_UP_ROUTE } from '@pages/Auth/AuthRouter'
import { generateRandomColor } from '@util/color'
import { DEMO_PROJECT_NAME } from '@util/constants/constants'
import { useParams } from '@util/react-router/useParams'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { useProjectId } from '@/hooks/useProjectId'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

const ProjectPicker = () => {
	const { allProjects, currentProject, currentWorkspace } =
		useApplicationContext()
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { projectId } = useProjectId()

	const { isProjectLevelMember } = useAuthContext()

	const isWorkspaceLevel = workspace_id !== undefined
	const navigate = useNavigate()
	const location = useLocation()
	const isInDemoProject = projectId === DEMO_WORKSPACE_PROXY_APPLICATION_ID

	const projectOptions = allProjects
		? allProjects.map((project) => {
				const isSelected = projectId === project?.id
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
								flexShrink={0}
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
		<Box>
			<Menu>
				<Menu.Button
					kind="secondary"
					emphasis="medium"
					size="small"
					iconLeft={
						isWorkspaceLevel ? (
							<IconSolidArrowSmLeft size={14} />
						) : (
							<IconSolidBriefcase size={14} />
						)
					}
				>
					{isInDemoProject ? (
						<Link to={SIGN_UP_ROUTE} className={linkStyle}>
							<Text lines="1">{headerDisplayValue}</Text>
						</Link>
					) : (
						<Text lines="1">{headerDisplayValue}</Text>
					)}
				</Menu.Button>
				{!isInDemoProject && (
					<Menu.List>
						{projectOptions}
						{projectId && (
							<>
								<Menu.Divider />
								{!isProjectLevelMember && (
									<Menu.Item>
										<EnterpriseFeatureButton
											setting="enable_business_projects"
											name="More than 1 project"
											fn={async () =>
												navigate(
													`/w/${currentWorkspace?.id}/new`,
													{
														state: {
															previousLocation:
																location,
														},
													},
												)
											}
											variant="basic"
											className={linkStyle}
										>
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
										</EnterpriseFeatureButton>
									</Menu.Item>
								)}
								<Link
									to={`/${projectId}/settings/sessions`}
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
				)}
			</Menu>
		</Box>
	)
}

export default ProjectPicker
