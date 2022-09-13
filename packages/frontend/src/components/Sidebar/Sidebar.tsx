import { useAuthContext } from '@authentication/AuthContext'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { MiniWorkspaceIcon } from '@components/Header/WorkspaceDropdown/WorkspaceDropdown'
import SvgAppsIcon from '@icons/AppsIcon'
import SvgChartIcon from '@icons/ChartIcon'
import SvgUsersIcon from '@icons/UsersIcon'
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { DEMO_WORKSPACE_NAME } from '@util/constants/constants'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames/bind'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import SvgAnnouncementIcon from '../../static/AnnouncementIcon'
import SvgBriefcase2Icon from '../../static/Briefcase2Icon'
import SvgBugIcon from '../../static/BugIcon'
import SvgCreditCardIcon from '../../static/CreditCardIcon'
import SvgHomeIcon from '../../static/HomeIcon'
import SvgPlugIcon from '../../static/PlugIcon'
import SvgSessionsIcon from '../../static/SessionsIcon'
import Changelog from '../Changelog/Changelog'
import Tooltip from '../Tooltip/Tooltip'
import styles from './Sidebar.module.scss'

interface NavigationItem {
	Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
	displayName: string
	route: string
	className?: string
	hidden?: boolean
}

export const Sidebar = () => {
	const { currentProject } = useApplicationContext()
	const { checkPolicyAccess } = useAuthorization()
	const { isLoggedIn } = useAuthContext()
	const isWorkspace = currentProject === undefined
	const { project_id } = useParams<{ project_id: string }>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const isInDemoProject =
		projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID

	const LEAD_NAVIGATION_ITEMS: NavigationItem[] = [
		{
			Icon: SvgHomeIcon,
			displayName: 'Home',
			route: 'home',
			hidden: !(isInDemoProject && !isLoggedIn) && isWorkspace,
		},
		{
			Icon: SvgSessionsIcon,
			displayName: 'Sessions',
			route: 'sessions',
			hidden: !(isInDemoProject && !isLoggedIn) && isWorkspace,
		},
		{
			Icon: SvgBugIcon,
			displayName: 'Errors',
			route: 'errors',
			hidden: !(isInDemoProject && !isLoggedIn) && isWorkspace,
		},
		{
			Icon: SvgChartIcon,
			displayName: 'Dashboards',
			route: 'dashboards',
			hidden: isWorkspace || isInDemoProject,
		},
	]

	const END_NAVIGATION_ITEMS: NavigationItem[] = [
		{
			Icon: SvgPlugIcon,
			displayName: 'Setup',
			route: 'setup',
			hidden: isWorkspace,
		},
		{
			Icon: SvgUsersIcon,
			displayName: 'Team',
			route: 'team',
			hidden: !isWorkspace,
		},
		{
			Icon: SvgBriefcase2Icon,
			displayName: 'Project',
			route: 'settings',
		},
		{
			Icon: SvgCreditCardIcon,
			displayName: 'Billing',
			route: 'billing',
			hidden:
				!isWorkspace ||
				isOnPrem ||
				!checkPolicyAccess({ policyName: POLICY_NAMES.BillingView }),
		},
		{
			Icon: SvgAnnouncementIcon,
			displayName: 'Alerts',
			route: 'alerts',
			hidden: isWorkspace,
		},
		{
			Icon: SvgAppsIcon,
			displayName: 'Integrations',
			route: 'integrations',
			hidden:
				isWorkspace ||
				isOnPrem ||
				!checkPolicyAccess({
					policyName: POLICY_NAMES.IntegrationsUpdate,
				}),
		},
	]

	return (
		<>
			<div
				className={classNames(
					styles.staticSidebarWrapper,
					styles.sideBar,
				)}
			>
				{(!isWorkspace || isInDemoProject) && (
					<MiniWorkspaceIcon
						projectName={
							currentProject?.name ?? DEMO_WORKSPACE_NAME
						}
					/>
				)}
				{LEAD_NAVIGATION_ITEMS.filter(({ hidden }) => !hidden).map(
					({ Icon, displayName, route, className }) => (
						<MiniSidebarItem
							route={route}
							text={displayName}
							key={route}
						>
							<Icon
								className={classNames(styles.icon, className)}
								height="32px"
								width="32px"
							/>
						</MiniSidebarItem>
					),
				)}
				{projectIdRemapped !== DEMO_WORKSPACE_PROXY_APPLICATION_ID && (
					<>
						{!isWorkspace && (
							<div className={styles.settingsDivider} />
						)}
						{END_NAVIGATION_ITEMS.filter(
							({ hidden }) => !hidden,
						).map(({ Icon, displayName, route, className }) => (
							<MiniSidebarItem
								route={route}
								text={displayName}
								key={route}
							>
								<Icon
									className={classNames(
										styles.icon,
										className,
									)}
									height="32px"
									width="32px"
								/>
							</MiniSidebarItem>
						))}
					</>
				)}
				<div className={styles.changelogContainer}>
					<Changelog />
				</div>
			</div>
		</>
	)
}

const MiniSidebarItem: React.FC<
	React.PropsWithChildren<{
		route: string
		text: string
	}>
> = ({ route, text, children }) => {
	const { project_id, workspace_id } = useParams<{
		project_id: string
		workspace_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const isWorkspace = workspace_id !== undefined
	const workspaceOrProjectId = workspace_id || projectIdRemapped
	const { pathname } = useLocation()
	const page = pathname.split('/')[isWorkspace ? 3 : 2] ?? ''

	return (
		<Link
			className={styles.miniRow}
			to={`${isWorkspace ? '/w' : ''}/${workspaceOrProjectId}/${route}`}
		>
			<Tooltip
				title={text}
				placement="right"
				align={{ offset: [16, 0] }}
				mouseEnterDelay={0}
			>
				<div
					className={classNames([
						styles.miniSidebarIconWrapper,
						page.includes(route) && styles.selected,
					])}
				>
					{children}
				</div>
			</Tooltip>
		</Link>
	)
}
