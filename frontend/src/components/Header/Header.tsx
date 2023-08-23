import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import CommandBar from '@components/CommandBar/CommandBar'
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import ProjectPicker from '@components/Header/components/ProjectPicker/ProjectPicker'
import { linkStyle } from '@components/Header/styles.css'
import { OpenCommandBarShortcut } from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import { LinkButton } from '@components/LinkButton'
import {
	useGetBillingDetailsForProjectQuery,
	useGetProjectQuery,
	useGetSubscriptionDetailsQuery,
	useGetSystemConfigurationQuery,
} from '@graph/hooks'
import { Maybe, PlanType, ProductType, Project } from '@graph/schemas'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidArrowSmLeft,
	IconSolidArrowSmRight,
	IconSolidAtSymbol,
	IconSolidChartBar,
	IconSolidChartPie,
	IconSolidChat,
	IconSolidCog,
	IconSolidDesktopComputer,
	IconSolidDocumentText,
	IconSolidDotsHorizontal,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidOfficeBuilding,
	IconSolidPlayCircle,
	IconSolidSearch,
	IconSolidSparkles,
	IconSolidSpeakerphone,
	IconSolidSwitchHorizontal,
	IconSolidUserCircle,
	IconSolidViewGridAdd,
	Menu,
	Stack,
	Text,
	TextLink,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import useFeatureFlag, { Feature } from '@hooks/useFeatureFlag/useFeatureFlag'
import { useProjectId } from '@hooks/useProjectId'
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
import { showIntercomMessage } from '@util/window'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect } from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { useSessionStorage } from 'react-use'

import { useIsSettingsPath } from '@/hooks/useIsSettingsPath'

import { CommandBar as CommandBarV1 } from './CommandBar/CommandBar'
import styles from './Header.module.css'

type Props = {
	fullyIntegrated?: boolean
}

export const useBillingHook = ({
	workspace_id,
	project_id,
}: {
	workspace_id?: string
	project_id?: string
}) => {
	const { isAuthLoading, isLoggedIn } = useAuthContext()
	const { data: projectData } = useGetProjectQuery({
		variables: { id: project_id || '' },
		skip: !project_id?.length || !!workspace_id?.length,
	})

	const {
		loading: subscriptionLoading,
		data: subscriptionData,
		refetch: refetchSubscription,
	} = useGetSubscriptionDetailsQuery({
		variables: {
			workspace_id: workspace_id || projectData?.workspace?.id || '',
		},
		skip:
			isAuthLoading ||
			!isLoggedIn ||
			(!workspace_id?.length && !projectData?.workspace?.id),
	})

	return {
		loading: subscriptionLoading,
		subscriptionData: subscriptionData,
		refetchSubscription: refetchSubscription,
		issues:
			!subscriptionLoading &&
			subscriptionData?.subscription_details.lastInvoice?.status
				?.length &&
			!['paid', 'void', 'draft'].includes(
				subscriptionData.subscription_details.lastInvoice.status,
			),
	}
}

export const Header: React.FC<Props> = ({ fullyIntegrated }) => {
	const { projectId } = useProjectId()
	const { isHighlightAdmin, isLoggedIn, signOut } = useAuthContext()
	const showAnalytics = useFeatureFlag(Feature.Analytics)
	const { currentProject, currentWorkspace } = useApplicationContext()
	const workspaceId = currentWorkspace?.id

	const { pathname, state } = useLocation()
	const goBackPath = state?.previousPath ?? `/${projectId}/sessions`
	const parts = pathname.split('/')
	const currentPage = parts.length >= 3 ? parts[2] : undefined
	const isSetup = parts.indexOf('setup') !== -1
	const { isSettings } = useIsSettingsPath()

	const { toggleShowKeyboardShortcutsGuide, commandBarDialog } =
		useGlobalContext()

	const pages = [
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
			key: 'alerts',
			icon: IconSolidSpeakerphone,
		},
	]

	const inProjectOrWorkspace = isLoggedIn && (projectId || workspaceId)

	return (
		<>
			<CommandBar />
			<CommandBarV1 />
			<Box background="n2" borderBottom="secondary">
				{!!projectId && !isSettings && getBanner(projectId, isSetup)}
				<Box
					display="flex"
					alignItems="center"
					px="12"
					py="8"
					justifyContent="space-between"
				>
					{isSetup ? (
						<LinkButton
							to={goBackPath}
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
									{currentProject?.name ?? 'Highlight'}
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
							{projectId && !isSettings && (
								<Box display="flex" alignItems="center" gap="4">
									{pages.map((p) => {
										return (
											<LinkButton
												iconLeft={
													<p.icon
														size={14}
														color={
															currentPage ===
															p.key
																? undefined
																: vars.theme
																		.interactive
																		.fill
																		.secondary
																		.content
																		.text
														}
													/>
												}
												emphasis={
													currentPage === p.key
														? 'high'
														: 'low'
												}
												kind={
													currentPage === p.key
														? 'primary'
														: 'secondary'
												}
												to={`/${projectId}/${p.key}`}
												key={p.key}
												trackingId={`header-link-click-${p.key}`}
											>
												{titleCaseString(p.key)}
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
											{showAnalytics && (
												<Link
													to={`/${projectId}/dashboards`}
													className={linkStyle}
												>
													<Menu.Item>
														<Box
															display="flex"
															alignItems="center"
															gap="4"
														>
															<IconSolidChartBar
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
															Dashboards
														</Box>
													</Menu.Item>
												</Link>
											)}
											<Link
												to={`/${projectId}/integrations`}
												className={linkStyle}
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
													>
														<IconSolidViewGridAdd
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
														Integrations
													</Box>
												</Menu.Item>
											</Link>
											{showAnalytics && (
												<Link
													to={`/${projectId}/analytics`}
													className={linkStyle}
												>
													<Menu.Item>
														<Box
															display="flex"
															alignItems="center"
															gap="4"
														>
															<IconSolidChartPie
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
															Analytics
														</Box>
													</Menu.Item>
												</Link>
											)}
											<Link
												to={`/${projectId}/setup`}
												className={linkStyle}
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
													>
														<IconSolidDesktopComputer
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
														Setup
													</Box>
												</Menu.Item>
											</Link>
											{isHighlightAdmin && (
												<Link
													to={`/${projectId}/traces`}
													className={linkStyle}
												>
													<Menu.Item>
														<Box
															display="flex"
															alignItems="center"
															gap="4"
														>
															<IconSolidSparkles
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
															Traces
														</Box>
													</Menu.Item>
												</Link>
											)}
										</Menu.List>
									</Menu>
								</Box>
							)}
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
							justifyContent="flex-end"
							alignItems="center"
							gap="12"
							style={{ zIndex: 20000 }}
							width="full"
						>
							{!!projectId &&
								!fullyIntegrated &&
								!isSetup &&
								!isSettings && (
									<LinkButton
										to={`/${projectId}/setup`}
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
							{!isSetup && !isSettings && (
								<Box display="flex" alignItems="center" gap="4">
									{!!projectId && (
										<Button
											trackingId="quickSearchClicked"
											kind="secondary"
											size="small"
											emphasis="high"
											iconLeft={<IconSolidSearch />}
											onClick={commandBarDialog.toggle}
										>
											<Badge
												variant="outlineGray"
												shape="basic"
												size="small"
												label={OpenCommandBarShortcut.shortcut.join(
													'+',
												)}
											/>
										</Button>
									)}
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
											<Link
												to="/switch"
												className={linkStyle}
											>
												<Menu.Item>
													<Box
														display="flex"
														alignItems="center"
														gap="4"
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
														Switch workspace
													</Box>
												</Menu.Item>
											</Link>
											<Menu.Item
												onClick={() => {
													showIntercomMessage()
												}}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidChat
														size={14}
														color={
															vars.theme
																.interactive
																.fill.secondary
																.content.text
														}
													/>
													Chat / Support
												</Box>
											</Menu.Item>
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

const getBanner = (projectId: string, isSetup: boolean) => {
	if (projectId === DEMO_WORKSPACE_PROXY_APPLICATION_ID) {
		return <DemoWorkspaceBanner />
	} else if (!isSetup) {
		return <BillingBanner />
	}
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
		skip: !projectId,
	})
	const [hasReportedTrialExtension, setHasReportedTrialExtension] =
		useLocalStorage('highlightReportedTrialExtension', false)
	const { issues: billingIssues } = useBillingHook({ project_id: projectId })

	useEffect(() => {
		if (
			!hasReportedTrialExtension &&
			data?.workspace_for_project?.trial_extension_enabled
		) {
			analytics.track('TrialExtensionEnabled', {
				projectId,
				workspace_id: data?.workspace_for_project.id,
			})
			setHasReportedTrialExtension(true)
		}
	}, [
		data?.workspace_for_project?.id,
		data?.workspace_for_project?.trial_extension_enabled,
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
	const hasTrial = isProjectWithinTrial(data?.workspace_for_project)

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
			'2023-07-17T00:00:00Z',
			'2023-07-22T00:00:00Z',
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
			data?.workspace_for_project?.trial_end_date,
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
			className={clsx(styles.trialWrapper)}
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

	const day = moment().diff(moment('2023-07-17T16:00:00Z'), 'days') + 1
	if (day < 1 || day > 5) {
		toggleShowBanner(false)
		return null
	}
	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			Launch Week 2 is here.{' '}
			<a
				target="_blank"
				href="https://www.highlight.io/launch-week-2"
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

	if (allProjects) {
		if (allProjects[0]?.id !== currentProject?.id) {
			toVisit = `/${allProjects[0]?.id}/${path}`
		} else {
			toVisit = `/${allProjects[allProjects.length - 1]?.id}/${path}`
		}
	}

	return toVisit
}
