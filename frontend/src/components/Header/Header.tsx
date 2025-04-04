import { useAuthContext } from '@authentication/AuthContext'
import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import ProjectPicker from '@components/Header/components/ProjectPicker/ProjectPicker'
import { betaTag, linkStyle } from '@components/Header/styles.css'
import { useBillingHook } from '@components/Header/useBillingHook'
import { LinkButton } from '@components/LinkButton'
import {
	useGetBillingDetailsForProjectQuery,
	useGetSystemConfigurationQuery,
	useGetWorkspacesQuery,
} from '@graph/hooks'
import { Maybe, PlanType, ProductType, Project } from '@graph/schemas'
import {
	Badge,
	Box,
	ButtonIcon,
	IconProps,
	IconSolidArrowSmLeft,
	IconSolidArrowSmRight,
	IconSolidAtSymbol,
	IconSolidChartBar,
	IconSolidCheck,
	IconSolidCog,
	IconSolidDesktopComputer,
	IconSolidDocumentText,
	IconSolidDotsHorizontal,
	IconSolidGrafana,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidOfficeBuilding,
	IconSolidPlayCircle,
	IconSolidPlusSm,
	IconSolidBell,
	IconSolidSwitchHorizontal,
	IconSolidTraces,
	IconSolidUserCircle,
	IconSolidViewGridAdd,
	Menu,
	Stack,
	Text,
	TextLink,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useLocalStorageProjectId, useProjectId } from '@hooks/useProjectId'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import SvgXIcon from '@icons/XIcon'
import {
	getQuotaPercents,
	getTrialEndDateMessage,
} from '@pages/Billing/utils/utils'
import useLocalStorage from '@rehooks/local-storage'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { isProjectWithinTrial } from '@util/billing/billing'
import { titleCaseString } from '@util/string'
import { Divider } from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import { Link, matchRoutes, useLocation, useNavigate } from 'react-router-dom'
import { useSessionStorage } from 'react-use'

import { useGetWorkspaceSettingsQuery } from '@/graph/generated/hooks'
import { useIsSettingsPath } from '@/hooks/useIsSettingsPath'
import { generateRandomColor } from '@/util/color'

import { CalendlyButton } from '../CalendlyModal/CalendlyButton'
import { CommandBar as CommandBarV1 } from './CommandBar/CommandBar'
import styles from './Header.module.css'
import InkeepChatSupportMenuItem from '@/components/Header/InkeepChatSupportMenuItem'

type Props = {
	fullyIntegrated?: boolean
}

const useProjectRedirectLink = () => {
	const location = useLocation()
	const { projectId } = useProjectId()
	const { projectId: localStorageProjectId } = useLocalStorageProjectId()
	const { allProjects, currentWorkspace } = useApplicationContext()
	const workspaceId = currentWorkspace?.id
	const localStorageProject = allProjects?.find(
		(p) => String(p?.id) === String(localStorageProjectId),
	)
	const verificationPaths = [
		{ path: '/:project_id/setup/*' },
		{ path: '/:project_id/setup/backend/*' },
		{ path: '/:project_id/setup/backend-logging/*' },
		{ path: '/:project_id/setup/traces/*' },
		{ path: '/:project_id/setup/alerts/*' },
	]
	const updateBackToPath = (projectId: string | number) => {
		const match = matchRoutes(verificationPaths, location)?.at(0)
		const routePath = match?.route?.path

		switch (routePath) {
			case '/:project_id/setup/backend/*':
				return `/${projectId}/errors`
			case '/:project_id/setup/backend-logging/*':
				return `/${projectId}/logs`
			case '/:project_id/setup/traces/*':
				return `/${projectId}/traces`
			case '/:project_id/setup/alerts/*':
				return `/${projectId}/alerts`
			default:
				return `/${projectId}/sessions`
		}
	}

	const getProjectRedirectLink = () => {
		const isWorkspaceTab =
			workspaceId &&
			matchRoutes([{ path: '/w/:workspace_id/*' }], location)?.at(0)
				?.params?.workspace_id === workspaceId

		if (!localStorageProject) {
			if (allProjects && allProjects.length === 0 && isWorkspaceTab) {
				return `/w/${workspaceId}/new`
			}
			if (isWorkspaceTab && allProjects) {
				return `/${allProjects[0]?.id}/sessions`
			}

			if (projectId && projectId !== 'demo') {
				return updateBackToPath(projectId)
			}
		}
		//if user in workspace tab and have not slected any of the projects. setting default to first project.
		//if user does not have any projects. ideally we need to force the user to create atleast one project if they are trying to click on go back to project.
		if (
			isWorkspaceTab &&
			(!projectId || projectId == 'demo') &&
			allProjects?.length
		) {
			return `/${allProjects[0]?.id}/sessions`
		}
		return updateBackToPath(localStorageProjectId || projectId)
	}
	const goBackPath = getProjectRedirectLink()

	return goBackPath
}

type Page = {
	key: string
	icon: ({ size, ...props }: IconProps) => JSX.Element
	isBeta?: boolean
}

const PAGES: Page[] = [
	{
		key: 'sessions',
		icon: IconSolidPlayCircle,
	},
	{
		key: 'errors',
		icon: IconSolidLightningBolt,
	},
	{
		key: 'logs',
		icon: IconSolidLogs,
	},
	{
		key: 'traces',
		icon: IconSolidTraces,
	},
	{
		key: 'dashboards',
		icon: IconSolidChartBar,
	},
	{
		key: 'alerts',
		icon: IconSolidBell,
	},
	{
		key: 'integrations',
		icon: IconSolidViewGridAdd,
	},
	{
		key: 'connect',
		icon: IconSolidDesktopComputer,
	},
]

export const Header: React.FC<Props> = ({ fullyIntegrated }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const { projectId } = useProjectId()
	const { projectId: localStorageProjectId } = useLocalStorageProjectId()
	const { isLoggedIn, signOut } = useAuthContext()
	const { allProjects, currentWorkspace } = useApplicationContext()
	const workspaceId = currentWorkspace?.id
	const localStorageProject = allProjects?.find(
		(p) => String(p?.id) === String(localStorageProjectId),
	)

	const goBackPath = useProjectRedirectLink()
	const { isSettings } = useIsSettingsPath()

	const { toggleShowKeyboardShortcutsGuide } = useGlobalContext()

	const { isProjectLevelMember } = useAuthContext()

	const inProjectOrWorkspace = isLoggedIn && (projectId || workspaceId)

	const { data: workspacesData, loading: workspacesLoading } =
		useGetWorkspacesQuery()

	const workspaceOptions = useMemo(() => {
		const currentWorkspaces = workspacesData?.workspaces || []
		const joinableWorkspaces = workspacesData?.joinable_workspaces || []
		const all = [...currentWorkspaces, ...joinableWorkspaces]
		return all.map((workspace) => ({
			id: workspace?.id,
			value: workspace?.id,
			displayValue: workspace?.name,
		}))
	}, [workspacesData?.workspaces, workspacesData?.joinable_workspaces])

	return (
		<>
			<CommandBarV1 />
			<Box background="n2" borderBottom="secondary">
				{!!projectId && !isSettings && getBanner(projectId)}
				<Box
					display="flex"
					alignItems="center"
					px="12"
					py="8"
					justifyContent="space-between"
				>
					{isSettings && localStorageProjectId ? (
						<LinkButton
							to={goBackPath || '/'}
							kind="secondary"
							emphasis="low"
							trackingId="setup_back-button"
						>
							<Box
								display="flex"
								whiteSpace="nowrap"
								alignItems="center"
								gap="8"
							>
								<IconSolidArrowSmLeft />{' '}
								<Text>
									Back to{' '}
									{localStorageProject?.name ?? 'Project'}
								</Text>
							</Box>
						</LinkButton>
					) : inProjectOrWorkspace ||
					  projectId === DEMO_WORKSPACE_PROXY_APPLICATION_ID ? (
						<Box
							display="flex"
							alignItems="center"
							gap="12"
							style={{ zIndex: 20000 }}
							width="full"
						>
							<ProjectPicker />
							{projectId && !isSettings && <Navbar />}
						</Box>
					) : (
						<Box
							display="flex"
							justifyContent="space-between"
							width="full"
						>
							<LinkButton
								to="/"
								kind="secondary"
								emphasis="low"
								size="small"
								iconLeft={<IconSolidArrowSmLeft size={14} />}
								trackingId="navHomeLink"
							>
								Back to Highlight
							</LinkButton>
							<a
								className={styles.homeLink}
								href="https://www.highlight.io"
							>
								<SvgHighlightLogoOnLight
									width={28}
									height={28}
								/>
							</a>
						</Box>
					)}
					{inProjectOrWorkspace && (
						<Box
							display="flex"
							flexShrink={0}
							justifyContent="flex-end"
							alignItems="center"
							gap="12"
							style={{ zIndex: 20000 }}
						>
							{!!projectId && !fullyIntegrated && !isSettings && (
								<LinkButton
									to={`/${projectId}/connect`}
									state={{
										previousPath: location.pathname,
									}}
									trackingId="header_setup-cta"
									emphasis="low"
								>
									<Stack
										direction="row"
										align="center"
										gap="4"
									>
										<Text>Finish setup </Text>
										<IconSolidArrowSmRight />
									</Stack>
								</LinkButton>
							)}
							{!isSettings && (
								<Box display="flex" alignItems="center" gap="4">
									<CalendlyButton />
									<Box>
										<ButtonIcon
											cssClass={styles.button}
											kind="secondary"
											size="small"
											emphasis="high"
											onClick={() => {
												window.open(
													'https://discord.gg/yxaXEAqgwN',
													'_blank',
												)
											}}
											icon={
												<FaDiscord
													style={{
														height: 14,
														width: 14,
													}}
													color={
														vars.theme.interactive
															.fill.secondary
															.content.text
													}
												/>
											}
										/>
										<ButtonIcon
											cssClass={styles.button}
											kind="secondary"
											size="small"
											emphasis="high"
											onClick={() => {
												window.open(
													'https://github.com/highlight/highlight',
													'_blank',
												)
											}}
											icon={
												<FaGithub
													style={{
														height: 14,
														width: 14,
													}}
													color={
														vars.theme.interactive
															.fill.secondary
															.content.text
													}
												/>
											}
										/>
									</Box>
									<Menu>
										<Menu.Button
											emphasis="low"
											kind="secondary"
											icon={
												<IconSolidCog
													size={14}
													color={vars.color.n11}
												/>
											}
										/>
										<Menu.List>
											{!isProjectLevelMember && (
												<Link
													to={`/w/${workspaceId}/team`}
													className={linkStyle}
												>
													<Menu.Item>
														<Box
															display="flex"
															alignItems="center"
															gap="4"
														>
															<IconSolidOfficeBuilding
																size={14}
																color={
																	vars.theme
																		.interactive
																		.fill
																		.secondary
																		.content
																		.text
																}
															/>
															Workspace settings
														</Box>
													</Menu.Item>
												</Link>
											)}
											<Link
												to={`/w/${workspaceId}/account/${
													auth.googleProvider
														? 'auth'
														: 'email-settings'
												}`}
												className={linkStyle}
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
													>
														<IconSolidUserCircle
															size={14}
															color={
																vars.theme
																	.interactive
																	.fill
																	.secondary
																	.content
																	.text
															}
														/>
														Account settings
													</Box>
												</Menu.Item>
											</Link>
											<Menu.Divider />
											<Menu.Item
												style={{
													paddingTop: 0,
													paddingBottom: 0,
												}}
											>
												<Menu>
													<Menu.Button
														style={{
															paddingLeft: 0,
														}}
														size="small"
														emphasis="low"
														kind="secondary"
														onClick={(e: any) =>
															e.stopPropagation()
														}
													>
														<Box
															gap="4"
															display="flex"
															alignItems="center"
														>
															<IconSolidSwitchHorizontal
																size={14}
																color={
																	vars.theme
																		.interactive
																		.fill
																		.secondary
																		.content
																		.text
																}
															/>
															<Text
																color="n11"
																weight="regular"
															>
																Switch workspace
															</Text>
														</Box>
													</Menu.Button>
													<Menu.List>
														{workspacesLoading
															? null
															: workspaceOptions.map(
																	(
																		workspace,
																	) => {
																		const isSelected =
																			workspaceId ===
																			workspace?.id
																		return (
																			<Menu.Item
																				key={
																					workspace?.id
																				}
																				onClick={() => {
																					navigate(
																						`/w/${workspace?.id}`,
																					)
																				}}
																				style={{
																					marginTop:
																						'2px',
																					...(isSelected && {
																						backgroundColor:
																							vars
																								.color
																								.n2,
																					}),
																				}}
																			>
																				<Box
																					display="flex"
																					alignItems="center"
																					gap="4"
																				>
																					<Box
																						flexShrink={
																							0
																						}
																						margin="4"
																						style={{
																							height: 8,
																							width: 8,
																							backgroundColor:
																								generateRandomColor(
																									workspace?.displayValue ??
																										'',
																								),
																							borderRadius:
																								'50%',
																						}}
																					></Box>
																					<Box
																						display="flex"
																						alignItems="center"
																						justifyContent="space-between"
																						width="full"
																						gap="2"
																					>
																						<Text lines="1">
																							{workspace?.displayValue ??
																								''}
																						</Text>
																						{isSelected && (
																							<IconSolidCheck
																								size={
																									14
																								}
																							/>
																						)}
																					</Box>
																				</Box>
																			</Menu.Item>
																		)
																	},
																)}
														<Divider className="mb-0 mt-1" />
														<Link
															to="/new"
															state={{
																previousLocation:
																	location,
															}}
															className={
																linkStyle
															}
														>
															<Menu.Item>
																<Box
																	display="flex"
																	alignItems="center"
																	gap="4"
																>
																	<IconSolidPlusSm
																		size={
																			14
																		}
																		color={
																			vars
																				.color
																				.n9
																		}
																	/>
																	Create new
																	workspace
																</Box>
															</Menu.Item>
														</Link>
														{!isProjectLevelMember && (
															<Link
																to={`/${workspaceId}/settings`}
																className={
																	linkStyle
																}
															>
																<Menu.Item>
																	<Box
																		display="flex"
																		alignItems="center"
																		gap="4"
																	>
																		<IconSolidCog
																			size={
																				14
																			}
																			color={
																				vars
																					.color
																					.n9
																			}
																		/>
																		Workspace
																		settings
																	</Box>
																</Menu.Item>
															</Link>
														)}
													</Menu.List>
												</Menu>
											</Menu.Item>
											<InkeepChatSupportMenuItem />
											<a
												href="https://www.highlight.io/docs"
												className={linkStyle}
												target="_blank"
												rel="noreferrer"
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
													>
														<IconSolidDocumentText
															size={14}
															color={
																vars.theme
																	.interactive
																	.fill
																	.secondary
																	.content
																	.text
															}
														/>
														Documentation
													</Box>
												</Menu.Item>
											</a>
											<Menu.Item
												onClick={() => {
													toggleShowKeyboardShortcutsGuide(
														true,
													)
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidAtSymbol
														size={14}
														color={
															vars.theme
																.interactive
																.fill.secondary
																.content.text
														}
													/>
													Shortcuts
												</Box>
											</Menu.Item>
											<Menu.Divider />
											<Menu.Item
												onClick={async () => {
													try {
														signOut()
													} catch (e) {
														console.log(e)
													}
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													Log out
												</Box>
											</Menu.Item>
										</Menu.List>
									</Menu>
								</Box>
							)}
						</Box>
					)}
				</Box>
			</Box>
		</>
	)
}

const getBanner = (projectId: string) => {
	if (projectId === DEMO_WORKSPACE_PROXY_APPLICATION_ID) {
		return <DemoWorkspaceBanner />
	}

	return <BillingBanner />
}

const APPROACHING_QUOTA_THRESHOLD = 0.8

const BillingBanner: React.FC = () => {
	const { toggleShowBanner } = useGlobalContext()
	const [temporarilyHideBanner, setTemporarilyHideBanner] = useSessionStorage(
		'highlightHideFreePlanBanner',
		false,
	)
	const { currentWorkspace } = useApplicationContext()
	const { projectId } = useProjectId()

	const { data: systemData } = useGetSystemConfigurationQuery({
		// check for updates every minute
		pollInterval: 1000 * 60,
	})
	const { data, loading } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: projectId! },
		skip: !projectId || projectId === DEMO_PROJECT_ID,
	})
	const [hasReportedTrialExtension, setHasReportedTrialExtension] =
		useLocalStorage('highlightReportedTrialExtension', false)
	const { loading: subscriptionLoading, subscriptionData } = useBillingHook({
		project_id: projectId,
	})
	const billingIssues =
		!subscriptionLoading &&
		!!subscriptionData?.subscription_details?.billingIssue

	useEffect(() => {
		if (
			!hasReportedTrialExtension &&
			data?.project?.workspace?.trial_extension_enabled
		) {
			analytics.track('TrialExtensionEnabled', {
				projectId,
				workspace_id: data?.project?.workspace.id,
			})
			setHasReportedTrialExtension(true)
		}
	}, [
		data?.project?.workspace?.id,
		data?.project?.workspace?.trial_extension_enabled,
		hasReportedTrialExtension,
		projectId,
		setHasReportedTrialExtension,
	])

	const isMaintenance = moment().isBetween(
		systemData?.system_configuration?.maintenance_start,
		systemData?.system_configuration?.maintenance_end,
	)
	if (isMaintenance) {
		return <MaintenanceBanner />
	}

	if (billingIssues) {
		toggleShowBanner(true)
		return <BillingIssuesBanner />
	}

	if (loading) {
		toggleShowBanner(false)
		return null
	}

	if (temporarilyHideBanner) {
		toggleShowBanner(false)
		return null
	}

	if (!data) {
		toggleShowBanner(false)
		return null
	}

	let bannerMessage: string | React.ReactNode = ''
	const hasTrial = isProjectWithinTrial(data?.project?.workspace)

	const records = getQuotaPercents(data)

	const productsApproachingQuota = records
		.filter((r) => r[1] > APPROACHING_QUOTA_THRESHOLD && r[1] <= 1)
		.map((r) => r[0])
	const productsOverQuota = records.filter((r) => r[1] > 1).map((r) => r[0])

	if (productsOverQuota.length > 0) {
		bannerMessage += `You've reached your monthly limit for ${productsToString(
			productsOverQuota,
		)}.`
		if (data?.billingDetailsForProject?.plan.type === PlanType.Free) {
			bannerMessage += ` New data won't be recorded.`
		}
	}
	if (productsApproachingQuota.length > 0) {
		bannerMessage += ` You're approaching your monthly limit for ${productsToString(
			productsApproachingQuota,
		)}.`
	}

	if (!bannerMessage && !hasTrial) {
		const isLaunchWeek = moment().isBetween(
			'2024-10-21T13:00:00Z', // 6AM PST
			'2024-10-26T13:00:00Z',
		)
		if (isLaunchWeek) {
			return <LaunchWeekBanner />
		} else {
			toggleShowBanner(false)
			return null
		}
	}

	if (hasTrial) {
		bannerMessage = getTrialEndDateMessage(
			data?.project?.workspace?.trial_end_date,
		)
	}

	toggleShowBanner(true)

	return (
		<div className={styles.trialWrapper}>
			<div className={styles.trialTimeText}>
				{bannerMessage} Upgrade{' '}
				<Link to={`/w/${currentWorkspace?.id}/current-plan`}>here</Link>
				.
			</div>
			<button
				onClick={() => {
					analytics.track('TemporarilyHideFreePlanBanner', {
						hasTrial,
					})
					setTemporarilyHideBanner(true)
				}}
			>
				<SvgXIcon />
			</button>
		</div>
	)
}

const productsToString = (p: ProductType[]): string => {
	const lowers = p.map((p) => p.toLowerCase())
	if (lowers.length === 0) {
		return ''
	} else if (lowers.length === 1) {
		return lowers[0]
	} else if (lowers.length === 2) {
		return `${lowers[0]} and ${lowers[1]}`
	} else {
		lowers.reverse()
		const [last, ...rest] = lowers
		rest.reverse()
		return rest.join(', ') + `, and ${last}`
	}
}

const DemoWorkspaceBanner = () => {
	const { currentProject, allProjects } = useApplicationContext()
	const { pathname } = useLocation()
	const { toggleShowBanner } = useGlobalContext()

	const redirectLink = getRedirectLink(allProjects, currentProject, pathname)

	toggleShowBanner(true)

	return (
		<div
			className={styles.trialWrapper}
			style={{
				background: 'var(--color-green-600)',
			}}
		>
			<div className={clsx(styles.trialTimeText)}>
				Viewing Demo Project.{' '}
				<Link className={styles.demoLink} to={redirectLink}>
					Go back to your project.
				</Link>
			</div>
		</div>
	)
}

const MaintenanceBanner = () => {
	const { toggleShowBanner } = useGlobalContext()
	toggleShowBanner(true)

	return (
		<Box
			cssClass={styles.trialWrapper}
			style={{ backgroundColor: vars.color.y9 }}
		>
			<Text color="black">
				We are performing maintenance which may delay data ingest.
				Follow in{' '}
				<TextLink color="none" href="https://highlight.io/community">
					#incidents
				</TextLink>{' '}
				on our Discord for updates.
			</Text>
		</Box>
	)
}

const LaunchWeekBanner = () => {
	const { toggleShowBanner } = useGlobalContext()
	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			Launch Week 7 is here.{' '}
			<a
				target="_blank"
				href="https://dub.highlight.io/lw7-playlist"
				className={styles.trialLink}
				rel="noreferrer"
			>
				Follow along
			</a>{' '}
			to see what we've been building!
		</span>
	)

	return (
		<div className={clsx(styles.trialWrapper, styles.launchWeek)}>
			<div className={clsx(styles.trialTimeText)}>{bannerMessage}</div>
		</div>
	)
}

const BillingIssuesBanner = () => {
	const { toggleShowBanner } = useGlobalContext()
	const { currentWorkspace } = useApplicationContext()

	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			Looks like there are some issues with your billing details. 😔{' '}
			<a
				target="_blank"
				href={`/w/${currentWorkspace?.id}/current-plan`}
				className={styles.trialLink}
				rel="noreferrer"
			>
				Please update your payment method here.
			</a>
		</span>
	)

	return (
		<div className={clsx(styles.trialWrapper, styles.error)}>
			<div className={clsx(styles.trialTimeText)}>{bannerMessage}</div>
		</div>
	)
}

const getRedirectLink = (
	allProjects: Maybe<
		Maybe<
			{
				__typename?: 'Project' | undefined
			} & Pick<Project, 'id' | 'name'>
		>[]
	>,
	currentProject: Project | undefined,
	pathname: string,
): string => {
	const [, path] = pathname.split('/').filter((token) => token.length)
	let toVisit = `/new`

	if (allProjects?.length) {
		if (allProjects[0]?.id !== currentProject?.id) {
			toVisit = `/${allProjects[0]?.id}/${path}`
		} else {
			toVisit = `/${allProjects[allProjects.length - 1]?.id}/${path}`
		}
	}

	return toVisit
}

const Navbar: React.FC = () => {
	const { projectId } = useProjectId()
	const { currentWorkspace } = useApplicationContext()

	const parts = location.pathname.split('/')
	const currentPage = parts.length >= 3 ? parts[2] : undefined

	const containerRef = useRef<HTMLDivElement>(null)
	const [topbarPages, setTopbarPages] = useState<Page[]>(PAGES)
	const [menuPages, setMenuPages] = useState<Page[]>([])

	const { data: workspaceSettingsData } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})
	const enableGrafanaDashboard =
		workspaceSettingsData?.workspaceSettings?.enable_grafana_dashboard

	useEffect(() => {
		const observer = new ResizeObserver(() => {
			if (!containerRef.current) return
			const topbarItemCount = Math.floor(
				containerRef.current.offsetWidth / 100,
			)

			const newTopbarPages = PAGES.slice(0, topbarItemCount)
			const newMenuPages = PAGES.slice(topbarItemCount)

			setTopbarPages(newTopbarPages)
			setMenuPages(newMenuPages)
		})

		observer.observe(containerRef.current!)
		return () => observer.disconnect()
	}, [])

	let grafanaItem = (
		<Menu.Item disabled={!enableGrafanaDashboard}>
			<Box display="flex" alignItems="center" gap="4">
				<IconSolidGrafana
					size={14}
					color={vars.theme.interactive.fill.secondary.content.text}
				/>
				Grafana Dashboard
				<Badge
					shape="basic"
					size="small"
					variant="outlineGray"
					label="Enterprise"
				/>
			</Box>
		</Menu.Item>
	)

	if (enableGrafanaDashboard) {
		grafanaItem = (
			<Link to="https://grafana.highlight.io/" className={linkStyle}>
				{grafanaItem}
			</Link>
		)
	}

	return (
		<Box
			ref={containerRef}
			display="flex"
			alignItems="center"
			gap="4"
			width="full"
		>
			{topbarPages.map((p) => {
				return (
					<LinkButton
						iconLeft={
							<p.icon
								size={14}
								color={
									currentPage === p.key
										? undefined
										: vars.theme.interactive.fill.secondary
												.content.text
								}
							/>
						}
						emphasis={currentPage === p.key ? 'high' : 'low'}
						kind={currentPage === p.key ? 'primary' : 'secondary'}
						to={`/${projectId}/${p.key}`}
						key={p.key}
						trackingId={`header-link-click-${p.key}`}
					>
						{titleCaseString(p.key)}
						{p.isBeta ? <Box cssClass={betaTag}>Beta</Box> : null}
					</LinkButton>
				)
			})}
			<Menu>
				<Menu.Button
					icon={
						<IconSolidDotsHorizontal
							size={14}
							color={vars.color.n11}
						/>
					}
					emphasis="low"
					kind="secondary"
				/>
				<Menu.List>
					{menuPages.length > 0 && (
						<>
							{menuPages.map((p) => {
								const Icon = p!.icon
								return (
									<Link
										key={p!.key}
										to={`/${projectId}/${p!.key}`}
										className={linkStyle}
									>
										<Menu.Item>
											<Box
												display="flex"
												alignItems="center"
												gap="4"
											>
												<Icon
													size={14}
													color={
														vars.theme.interactive
															.fill.secondary
															.content.text
													}
												/>
												{titleCaseString(p!.key)}
											</Box>
										</Menu.Item>
									</Link>
								)
							})}
							<Menu.Divider />
						</>
					)}
					{grafanaItem}
				</Menu.List>
			</Menu>
		</Box>
	)
}
