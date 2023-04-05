import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import CommandBar from '@components/CommandBar/CommandBar'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import ProjectPicker from '@components/Header/components/ProjectPicker/ProjectPicker'
import Notifications from '@components/Header/Notifications/NotificationsV2'
import { linkStyle } from '@components/Header/styles.css'
import { OpenCommandBarShortcut } from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import { LinkButton } from '@components/LinkButton'
import { useGetBillingDetailsForProjectQuery } from '@graph/hooks'
import { Maybe, PlanType, Project } from '@graph/schemas'
import {
	Badge,
	Box,
	IconSolidArrowSmLeft,
	IconSolidArrowSmRight,
	IconSolidAtSymbol,
	IconSolidChartBar,
	IconSolidChartPie,
	IconSolidCog,
	IconSolidDesktopComputer,
	IconSolidDocumentText,
	IconSolidDotsHorizontal,
	IconSolidLightningBolt,
	IconSolidOfficeBuilding,
	IconSolidPlayCircle,
	IconSolidQuestionMarkCircle,
	IconSolidSearch,
	IconSolidSpeakerphone,
	IconSolidSwitchHorizontal,
	IconSolidUserCircle,
	IconSolidViewGridAdd,
	IconSolidViewList,
	Menu,
	Stack,
	Text,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import { useProjectId } from '@hooks/useProjectId'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import SvgXIcon from '@icons/XIcon'
import { useBillingHook } from '@pages/Billing/Billing'
import { getTrialEndDateMessage } from '@pages/Billing/utils/utils'
import useLocalStorage from '@rehooks/local-storage'
import { useApplicationContext } from '@routers/ProjectRouter/context/ApplicationContext'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { isProjectWithinTrial } from '@util/billing/billing'
import { client } from '@util/graph'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { titleCaseString } from '@util/string'
import { showIntercom } from '@util/window'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect } from 'react'
import { FaDiscord, FaGithub } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import { useSessionStorage } from 'react-use'

import { CommandBar as CommandBarV1 } from './CommandBar/CommandBar'
import styles from './Header.module.scss'

type Props = {
	fullyIntegrated?: boolean
	integrated?: boolean
}

export const Header: React.FC<Props> = ({ fullyIntegrated, integrated }) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { projectId: projectIdRemapped } = useProjectId()
	const { isLoggedIn } = useAuthContext()
	const { currentProject, currentWorkspace } = useApplicationContext()
	const workspaceId = currentWorkspace?.id

	const { pathname, state } = useLocation()
	const goBackPath = state?.previousPath ?? `/${project_id}/sessions`
	const parts = pathname.split('/')
	const currentPage = parts.length >= 3 ? parts[2] : undefined
	const isSetup = parts.indexOf('setup') !== -1

	const { toggleShowKeyboardShortcutsGuide, commandBarDialog } =
		useGlobalContext()
	const { admin } = useAuthContext()

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
			icon: IconSolidViewList,
		},
		{
			key: 'alerts',
			icon: IconSolidSpeakerphone,
		},
	]

	const inProjectOrWorkspace =
		isLoggedIn && (projectIdRemapped || workspaceId)

	return (
		<>
			<CommandBar />
			<CommandBarV1 />
			<Box background="n2" borderBottom="secondary">
				{!!project_id &&
					!isSetup &&
					getBanner(project_id, !!integrated)}
				<Box
					display="flex"
					alignItems="center"
					px="12"
					py={isLoggedIn ? '8' : '0'}
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
					  projectIdRemapped ===
							DEMO_WORKSPACE_PROXY_APPLICATION_ID ? (
						<Box
							display="flex"
							alignItems="center"
							gap="12"
							style={{ zIndex: 20000 }}
							width="full"
						>
							<ProjectPicker />
							{project_id && (
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
												to={`/${project_id}/${p.key}`}
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
											<Link
												to={`/${project_id}/dashboards`}
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
											<Link
												to={`/${project_id}/integrations`}
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
											<Link
												to={`/${project_id}/analytics`}
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
											<Link
												to={`/${project_id}/setup`}
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
							<Link className={styles.homeLink} to="/">
								<Button
									kind="secondary"
									emphasis="high"
									size="small"
									iconLeft={
										<IconSolidArrowSmLeft size={14} />
									}
									trackingId="navHomeLink"
								>
									Back to Highlight
								</Button>
							</Link>
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
							{!!projectIdRemapped &&
								!!fullyIntegrated &&
								!isSetup && (
									<LinkButton
										to={`/${project_id}/setup`}
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
							{!!project_id && !isSetup && (
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
							{!isSetup && (
								<Box display="flex" alignItems="center" gap="4">
									<Button
										kind="secondary"
										size="small"
										emphasis="high"
										onClick={() => {
											window.open(
												'https://discord.gg/yxaXEAqgwN',
												'_blank',
											)
										}}
										trackingId="DiscordSupportLinkClicked"
									>
										<Box
											display="flex"
											alignItems="center"
											as="span"
											gap="4"
										>
											<FaDiscord
												style={{
													height: 14,
													width: 14,
												}}
												color={
													vars.theme.interactive.fill
														.secondary.content.text
												}
											/>
											<Text lines="1">Community</Text>
										</Box>
									</Button>
									<Button
										kind="secondary"
										size="small"
										emphasis="high"
										onClick={() => {
											window.open(
												'https://github.com/highlight/highlight',
												'_blank',
											)
										}}
										trackingId="GithubButton"
									>
										<Box
											display="flex"
											alignItems="center"
											as="span"
											gap="4"
										>
											<FaGithub
												style={{
													height: 14,
													width: 14,
												}}
												color={
													vars.theme.interactive.fill
														.secondary.content.text
												}
											/>
											<Text lines="1">GitHub</Text>
										</Box>
									</Button>
									{inProjectOrWorkspace && <Notifications />}
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
												onClick={() =>
													showIntercom({ admin })
												}
											>
												<Box
													display="flex"
													alignItems="center"
													gap="4"
												>
													<IconSolidQuestionMarkCircle
														size={14}
														color={
															vars.theme
																.interactive
																.fill.secondary
																.content.text
														}
													/>
													Feedback
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
														auth.signOut()
													} catch (e) {
														console.log(e)
													}
													await client.clearStore()
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

const getBanner = (project_id: string, integrated: boolean) => {
	if (isOnPrem) {
		return <OnPremiseBanner />
	} else if (project_id === DEMO_WORKSPACE_APPLICATION_ID) {
		return <DemoWorkspaceBanner />
	} else {
		return <BillingBanner integrated={integrated} />
	}
}

const BillingBanner: React.FC<{ integrated: boolean }> = ({ integrated }) => {
	const { toggleShowBanner } = useGlobalContext()
	const [temporarilyHideBanner, setTemporarilyHideBanner] = useSessionStorage(
		'highlightHideFreePlanBanner',
		false,
	)
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})
	const [hasReportedTrialExtension, setHasReportedTrialExtension] =
		useLocalStorage('highlightReportedTrialExtension', false)
	const { issues: billingIssues } = useBillingHook({ project_id })

	useEffect(() => {
		if (
			!hasReportedTrialExtension &&
			data?.workspace_for_project?.trial_extension_enabled
		) {
			analytics.track('TrialExtensionEnabled', {
				project_id,
				workspace_id: data?.workspace_for_project.id,
			})
			setHasReportedTrialExtension(true)
		}
	}, [
		data?.workspace_for_project?.id,
		data?.workspace_for_project?.trial_extension_enabled,
		hasReportedTrialExtension,
		project_id,
		setHasReportedTrialExtension,
	])

	const isMaintenance = moment().isBetween(
		'2023-03-05T23:30:00Z',
		'2023-03-06T01:45:00Z',
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

	const isYoutubeLive = moment().isBetween(
		'2023-02-09T22:45:00Z',
		'2023-02-10T00:00:00Z',
	)
	if (isYoutubeLive) {
		toggleShowBanner(true)
		return <HighlightRoadshowBanner />
	}

	if (data?.billingDetailsForProject?.plan.type !== PlanType.Free) {
		// show Product Hunt banner at the time of a launch
		const isPHLaunch = moment().isBetween(
			'2023-01-10T08:00:00Z',
			'2023-01-11T08:00:00Z',
		)
		if (isPHLaunch) {
			toggleShowBanner(true)
			return <ProductHuntBanner />
		}

		toggleShowBanner(false)
		return null
	}

	if (project_id === DEMO_WORKSPACE_APPLICATION_ID) {
		toggleShowBanner(false)
		return null
	}

	let bannerMessage:
		| string
		| React.ReactNode = `You've used ${data?.billingDetailsForProject?.meter}/${data?.billingDetailsForProject?.plan.quota} of your free sessions.`
	const hasTrial = isProjectWithinTrial(data?.workspace_for_project)
	const canExtend = data?.workspace_for_project?.eligible_for_trial_extension
	const hasExceededSessionsForMonth =
		data?.billingDetailsForProject?.meter >
		data?.billingDetailsForProject?.plan.quota

	if (hasTrial) {
		bannerMessage = getTrialEndDateMessage(
			data?.workspace_for_project?.trial_end_date,
		)

		if (canExtend) {
			if (integrated) {
				bannerMessage = (
					<>
						You have unlimited Highlight until{' '}
						{moment(
							data?.workspace_for_project?.trial_end_date,
						).format('MM/DD')}
						.{' '}
						<Link
							className={styles.trialLink}
							to={`/w/${data?.workspace_for_project?.id}/about-you`}
						>
							Fill this out
						</Link>{' '}
						before your trial ends to extend this by another week!
					</>
				)
			} else {
				bannerMessage = (
					<>
						You have unlimited Highlight until{' '}
						{moment(
							data?.workspace_for_project?.trial_end_date,
						).format('MM/DD')}
						.{' '}
						<Link
							className={styles.trialLink}
							to={`/${project_id}/setup`}
						>
							Integrate
						</Link>{' '}
						before your trial ends to extend this by another week!
					</>
				)
			}
		}
	}

	toggleShowBanner(true)

	return (
		<div
			className={clsx(styles.trialWrapper, {
				[styles.error]: hasExceededSessionsForMonth,
			})}
		>
			<div className={clsx(styles.trialTimeText)}>
				{bannerMessage}
				{!canExtend && (
					<>
						{' '}
						Upgrade{' '}
						<Link
							className={styles.trialLink}
							to={`/w/${data?.workspace_for_project?.id}/current-plan`}
						>
							here!
						</Link>
					</>
				)}
			</div>
			{hasTrial && (
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
			)}
		</div>
	)
}

const OnPremiseBanner = () => {
	const { toggleShowBanner } = useGlobalContext()
	toggleShowBanner(true)

	return (
		<div
			className={styles.trialWrapper}
			style={{
				backgroundColor: 'var(--color-primary-inverted-background)',
			}}
		>
			<div className={clsx(styles.trialTimeText)}>
				Running Highlight On-premise{' '}
				{`v${import.meta.env.REACT_APP_COMMIT_SHA}`}
			</div>
		</div>
	)
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

const ProductHuntBanner = () => {
	const { toggleShowBanner } = useGlobalContext()

	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			Highlight is live on Product Hunt 🎉‍{' '}
			<a
				target="_blank"
				href="https://www.producthunt.com/posts/error-management-by-highlight"
				className={styles.trialLink}
				rel="noreferrer"
			>
				Support us
			</a>{' '}
			and we'll be forever grateful ❤️
		</span>
	)

	return (
		<div className={clsx(styles.trialWrapper, styles.productHunt)}>
			<div className={clsx(styles.trialTimeText)}>{bannerMessage}</div>
		</div>
	)
}

const HighlightRoadshowBanner = () => {
	const { toggleShowBanner } = useGlobalContext()

	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			The Highlight Roadshow is live on Youtube 🎉‍{' '}
			<a
				target="_blank"
				href="https://www.youtube.com/@thestartupstack/streams"
				className={styles.trialLink}
				rel="noreferrer"
			>
				Check it out
			</a>{' '}
			to see the latest features from our engineering team!️
		</span>
	)

	return (
		<div className={clsx(styles.trialWrapper, styles.youtube)}>
			<div className={clsx(styles.trialTimeText)}>{bannerMessage}</div>
		</div>
	)
}

const MaintenanceBanner = () => {
	const { toggleShowBanner } = useGlobalContext()

	toggleShowBanner(true)

	const bannerMessage = (
		<span>
			We are performance maintenance which may result in delayed data.
			Apologies for the inconvenience.{' '}
			<a
				target="_blank"
				href="https://highlight.io/community"
				className={styles.trialLink}
				rel="noreferrer"
			>
				Follow on Discord #incidents for updates.
			</a>
		</span>
	)

	return (
		<div className={clsx(styles.trialWrapper, styles.maintenance)}>
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
