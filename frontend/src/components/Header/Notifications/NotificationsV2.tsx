import { Button } from '@components/Button'
import CheckboxList from '@components/CheckboxList/CheckboxList'
import Dot from '@components/Dot/Dot'
import ConnectHighlightWithSlackButton from '@components/Header/components/ConnectHighlightWithSlackButton/ConnectHighlightWithSlackButton'
import Input from '@components/Input/Input'
import MenuItem from '@components/Menu/MenuItem'
import Tabs from '@components/Tabs/Tabs'
import { Box, IconSolidBell, IconSolidFilter, Text } from '@highlight-run/ui'
import SvgEmailPlusIcon from '@icons/EmailPlusIcon'
import SvgMailOpenIcon from '@icons/MailOpenIcon'
import SvgSearchIcon from '@icons/SearchIcon'
import SessionCommentTagSelect from '@pages/Player/Toolbar/NewCommentForm/SessionCommentTagSelect/SessionCommentTagSelect'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { Menu } from 'antd'
import Lottie from 'lottie-react'
import { useEffect, useMemo, useState } from 'react'

import { useGetNotificationsQuery } from '../../../graph/generated/hooks'
import NotificationAnimation from '../../../lottie/waiting.json'
import DotsMenu from '../../DotsMenu/DotsMenu'
import Popover from '../../Popover/Popover'
import PopoverListContent from '../../Popover/PopoverListContent'
import styles from './Notification.module.scss'
import NotificationItem from './NotificationItem/NotificationItem'
import { NotificationType, processNotifications } from './utils/utils'

const Notifications = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [allNotifications, setAllNotifications] = useState<any[]>([])
	const [inboxNotifications, setInboxNotifications] = useState<any[]>([])
	const [showPopover, setShowPopover] = useState(false)
	const [readNotifications, setReadNotifications] = useLocalStorage<string[]>(
		'highlight-read-notifications',
		[],
	)
	const {} = useGetNotificationsQuery({
		onCompleted: (data) => {
			if (data) {
				const processedNotifications = processNotifications(data)
				setAllNotifications(processedNotifications)
			}
		},
		pollInterval: 1000 * 30,
		variables: {
			project_id,
		},
		skip: !project_id,
	})

	useEffect(() => {
		const unreadNotifications = allNotifications.filter(
			(notification) => !readNotifications.includes(notification.id),
		)
		setInboxNotifications(unreadNotifications)
	}, [allNotifications, readNotifications])

	return (
		<Popover
			isList
			visible={showPopover}
			trigger={['click']}
			placement="bottomRight"
			content={
				<div className={styles.popover}>
					<Tabs
						className={styles.tabs}
						tabBarExtraContentClassName={styles.tabBarExtraContent}
						id="Notifications"
						tabs={[
							{
								key: 'Inbox',
								title: `Inbox (${inboxNotifications.length})`,
								panelContent:
									inboxNotifications.length !== 0 ? (
										<List
											notifications={inboxNotifications}
											readNotifications={
												readNotifications
											}
											onViewHandler={(
												notification: any,
											) => {
												setShowPopover(false)
												if (notification.id) {
													analytics.track(
														'Clicked on notification item',
														{},
													)
													setReadNotifications([
														...readNotifications,
														notification.id.toString(),
													])
												}
											}}
										/>
									) : (
										<>
											<div
												className={
													styles.emptyStateContainer
												}
											>
												<Lottie
													animationData={
														NotificationAnimation
													}
													className={styles.animation}
												/>
												<p>
													{allNotifications.length ===
													0
														? `Comments made in your project will show up here. Get started by mentioning a team member on an error or a session.`
														: `You have no unread notifications 🎉`}
												</p>
												<ConnectHighlightWithSlackButton
													style={{
														maxWidth: 'fit-content',
													}}
												/>
											</div>
										</>
									),
							},
							{
								key: 'All',
								title: `All (${allNotifications.length})`,
								panelContent:
									allNotifications.length !== 0 ? (
										<List
											notifications={allNotifications}
											readNotifications={
												readNotifications
											}
											onViewHandler={(
												notification: any,
											) => {
												setShowPopover(false)
												if (notification.id) {
													analytics.track(
														'Clicked on notification item',
														{},
													)
													setReadNotifications([
														...readNotifications,
														notification.id.toString(),
													])
												}
											}}
										/>
									) : (
										<>
											<div
												className={
													styles.emptyStateContainer
												}
											>
												<Lottie
													animationData={
														NotificationAnimation
													}
													className={styles.animation}
												/>
												<p>
													Comments made in your
													project will show up here.
													Get started by mentioning a
													team member on an error or a
													session.
												</p>
												<ConnectHighlightWithSlackButton
													style={{
														maxWidth: 'fit-content',
													}}
												/>
											</div>
										</>
									),
							},
						]}
						tabBarExtraContent={
							<DotsMenu
								trackingId="MarkAllNotificationsAsRead"
								menu={
									<Menu>
										<MenuItem
											icon={<SvgMailOpenIcon />}
											onClick={() => {
												setReadNotifications([
													...allNotifications.map(
														(notification) =>
															notification.id.toString(),
													),
												])
											}}
										>
											Mark all as read
										</MenuItem>
										<MenuItem
											icon={<SvgEmailPlusIcon />}
											onClick={() => {
												setReadNotifications([])
											}}
										>
											Mark all as unread
										</MenuItem>
									</Menu>
								}
							/>
						}
					/>
				</div>
			}
			onVisibleChange={(visible) => {
				if (visible) {
					analytics.track('Viewed notifications')
				}
				setShowPopover(visible)
			}}
		>
			<Button
				iconLeft={<IconSolidBell size={14} />}
				emphasis="low"
				kind="secondary"
				className={styles.buttonV2}
				trackingId="navBarNotificationsToggle"
			>
				<div className={styles.iconContainerV2}>
					{inboxNotifications.length !== 0 && (
						<div className={styles.dotContainer}>
							<Dot pulse />
						</div>
					)}
				</div>
			</Button>
		</Popover>
	)
}

export default Notifications

interface ListProps {
	notifications: any[]
	readNotifications: string[]
	onViewHandler: (notification: any) => void
}

const List = ({
	notifications,
	readNotifications,
	onViewHandler,
}: ListProps) => {
	const { project_id } = useParams<{ project_id: string }>()
	const [searchQuery, setSearchQuery] = useState('')
	const [showSessionNotifications, setShowSessionNotifications] =
		useLocalStorage(`showSessionNotifications-${project_id}`, true)
	const [showErrorNotifications, setShowErrorNotifications] = useLocalStorage(
		`showErrorNotifications-${project_id}`,
		true,
	)
	const [showFeedbackNotifications, setShowFeedbackNotifications] =
		useLocalStorage(`showFeedbackNotifications-${project_id}`, true)
	const [tagsToFilterBy, setTagsToFilterBy] = useLocalStorage<string[]>(
		`notificationTagsToFilterBy-${project_id}`,
		[],
	)
	const filtersCount = [
		!showSessionNotifications,
		!showErrorNotifications,
		!showFeedbackNotifications,
		tagsToFilterBy.length > 0,
	].reduce((acc, cur) => (cur ? acc + 1 : acc), 0)

	const notificationsToShow = useMemo(() => {
		const notificationTypesToExclude: NotificationType[] = []
		if (!showSessionNotifications) {
			notificationTypesToExclude.push(NotificationType.SessionComment)
		}
		if (!showErrorNotifications) {
			notificationTypesToExclude.push(NotificationType.ErrorComment)
		}
		if (!showFeedbackNotifications) {
			notificationTypesToExclude.push(NotificationType.SessionFeedback)
		}

		const filteredNotifications = notifications.filter((notification) => {
			return !notificationTypesToExclude.includes(notification.type)
		})

		if (tagsToFilterBy.length > 0) {
			return filteredNotifications.filter((notification) => {
				const tags = notification.tags || []

				return tagsToFilterBy.some((tag: string) => {
					return tags.some((t: string) => t.includes(tag))
				})
			})
		}

		if (searchQuery === '') {
			return filteredNotifications
		}
		const normalizedSearchQuery = searchQuery.toLowerCase()
		return filteredNotifications.filter((notification) => {
			const tags = notification.tags || []
			const hasMatchingTag = tags.some((tag: string) => {
				return tag.toLowerCase().includes(normalizedSearchQuery)
			})

			return (
				hasMatchingTag ||
				notification.text.toLowerCase().includes(normalizedSearchQuery)
			)
		})
	}, [
		notifications,
		searchQuery,
		showErrorNotifications,
		showFeedbackNotifications,
		showSessionNotifications,
		tagsToFilterBy,
	])

	const noSearchResults =
		searchQuery !== '' && notificationsToShow.length === 0
	const noNotificationsMatchingFilters =
		filtersCount > 0 && notificationsToShow.length === 0

	return (
		<>
			<div className={styles.searchContainer}>
				<Input
					size="small"
					placeholder="Search notifications"
					suffix={<SvgSearchIcon className={styles.searchIcon} />}
					className={styles.search}
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value)
					}}
					allowClear
				/>
				<Popover
					placement="rightTop"
					trigger={['click']}
					content={
						<main className={styles.filtersContainer}>
							<section>
								<CheckboxList
									checkboxOptions={[
										{
											checked: showSessionNotifications,
											onChange: (e) => {
												setShowSessionNotifications(
													e.target.checked,
												)
											},
											label: 'Session Comments',
											key: 'Session Comments',
										},
										{
											checked: showErrorNotifications,
											onChange: (e) => {
												setShowErrorNotifications(
													e.target.checked,
												)
											},
											label: 'Error Comments',
											key: 'Error Comments',
										},
										{
											checked: showFeedbackNotifications,
											onChange: (e) => {
												setShowFeedbackNotifications(
													e.target.checked,
												)
											},
											label: 'Session Feedback',
											key: 'Session Feedback',
										},
									]}
								/>
							</section>
							<section>
								<Box
									display="flex"
									flexDirection="column"
									gap="8"
								>
									<Text size="xSmall">Tags</Text>
									<SessionCommentTagSelect
										allowClear
										className={styles.tagsSelect}
										value={tagsToFilterBy}
										onChange={(e) => {
											setTagsToFilterBy(e)
										}}
										tagClosable={false}
										placeholder="signups, userflow, bug, error"
									/>
								</Box>
							</section>
							<section>
								<Button
									size="small"
									disabled={filtersCount === 0}
									onClick={() => {
										setShowErrorNotifications(true)
										setShowFeedbackNotifications(true)
										setShowSessionNotifications(true)
										setTagsToFilterBy([])
									}}
									trackingId="navBarNotificationsClearFilters"
								>
									Clear Filters
								</Button>
							</section>
						</main>
					}
				>
					<Button
						kind={filtersCount > 0 ? 'primary' : 'secondary'}
						iconLeft={<IconSolidFilter size={12} />}
						cssClass={styles.filtersButton}
						trackingId="navBarNotificationsFilters"
					>
						<Text lines="1">
							Filters
							{filtersCount > 0 ? ` (${filtersCount})` : ''}
						</Text>
					</Button>
				</Popover>
			</div>
			{!noSearchResults && !noNotificationsMatchingFilters ? (
				<PopoverListContent
					virtual
					virtualListHeight={600}
					maxHeight={600}
					defaultItemHeight={97}
					listItems={notificationsToShow.map(
						(notification, index) => (
							<NotificationItem
								notification={notification}
								key={notification?.id || index}
								viewed={readNotifications.includes(
									notification.id,
								)}
								onViewHandler={() => {
									onViewHandler(notification)
								}}
							/>
						),
					)}
				/>
			) : (
				<div className={styles.noResultsMessage}>
					{noSearchResults && (
						<p>
							No notifications matching '{searchQuery}'{' '}
							{noNotificationsMatchingFilters
								? 'and filters.'
								: '.'}
						</p>
					)}
					{!noSearchResults && noNotificationsMatchingFilters && (
						<p>No notifications matching filters.</p>
					)}
				</div>
			)}
		</>
	)
}
