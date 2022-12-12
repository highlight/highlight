import { useAuthContext } from '@authentication/AuthContext'
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip'
import {
	useGetDailyErrorFrequencyQuery,
	useGetErrorGroupQuery,
	useGetRecentErrorsQuery,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import { ErrorGroup, Maybe } from '@graph/schemas'
import SvgBugIcon from '@icons/BugIcon'
import { ErrorCommentButton } from '@pages/Error/components/ErrorComments/ErrorCommentButton/ErrorCommentButton'
import ErrorContext from '@pages/Error/components/ErrorContext/ErrorContext'
import {
	CreateModalType,
	ErrorCreateCommentModal,
} from '@pages/Error/components/ErrorCreateCommentModal/ErrorCreateCommentModal'
import { ErrorDistributionChart } from '@pages/Error/components/ErrorDistributionChart/ErrorDistributionChart'
import ErrorShareButton from '@pages/Error/components/ErrorShareButton/ErrorShareButton'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import Skeleton from 'react-loading-skeleton'
import { useHistory } from 'react-router'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from 'recharts'

import Button from '../../components/Button/Button/Button'
import Tooltip from '../../components/Tooltip/Tooltip'
import SvgDownloadIcon from '../../static/DownloadIcon'
import { IntegrationCard } from '../Sessions/IntegrationCard/IntegrationCard'
import ErrorBody from './components/ErrorBody/ErrorBody'
import { parseErrorDescriptionList } from './components/ErrorBody/utils/utils'
import ErrorAffectedUsers from './components/ErrorRightPanel/components/ErrorAffectedUsers/ErrorAffectedUsers'
import NoActiveErrorCard from './components/ErrorRightPanel/components/NoActiveErrorCard/NoActiveErrorCard'
import ErrorRightPanel from './components/ErrorRightPanel/ErrorRightPanel'
import ErrorSearchPanel from './components/ErrorSearchPanel/ErrorSearchPanel'
import ErrorTitle from './components/ErrorTitle/ErrorTitle'
import StackTraceSection from './components/StackTraceSection/StackTraceSection'
import styles from './ErrorPage.module.scss'
import useErrorPageConfiguration from './utils/ErrorPageUIConfiguration'

const ErrorPage = ({ integrated }: { integrated: boolean }) => {
	const { error_secure_id } = useParams<{
		error_secure_id: string
	}>()
	const { showBanner } = useGlobalContext()
	const { isLoggedIn } = useAuthContext()
	const {
		data,
		loading,
		error: errorQueryingErrorGroup,
	} = useGetErrorGroupQuery({
		variables: { secure_id: error_secure_id },
		skip: !error_secure_id,
		onCompleted: () => {
			analytics.track('Viewed error', { is_guest: !isLoggedIn })
		},
	})

	const [muteErrorCommentThread] = useMuteErrorCommentThreadMutation()

	const history = useHistory()
	const newCommentModalRef = useRef<HTMLDivElement>(null)
	const [deepLinkedCommentId, setDeepLinkedCommentId] = useState(
		new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		),
	)

	const {
		data: recentErrorsData,
		loading: recentErrorsLoading,
		error: errorQueryingRecentErrors,
	} = useGetRecentErrorsQuery({
		variables: { secure_id: error_secure_id },
		skip: !error_secure_id,
	})

	const { showLeftPanel } = useErrorPageConfiguration()

	const [showCreateCommentModal, setShowCreateCommentModal] =
		useState<CreateModalType>(CreateModalType.None)

	useEffect(() => {
		const urlParams = new URLSearchParams(location.search)

		const commentId = urlParams.get(PlayerSearchParameters.commentId)
		setDeepLinkedCommentId(commentId)

		const hasMuted = urlParams.get(PlayerSearchParameters.muted) === '1'
		if (commentId && hasMuted) {
			muteErrorCommentThread({
				variables: {
					id: commentId,
					has_muted: hasMuted,
				},
			}).then(() => {
				const searchParams = new URLSearchParams(location.search)
				searchParams.delete(PlayerSearchParameters.muted)
				history.replace(
					`${history.location.pathname}?${searchParams.toString()}`,
				)

				message.success('Muted notifications for this comment thread.')
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search])

	useEffect(() => analytics.page(), [error_secure_id])

	return (
		<>
			<Helmet>
				<title>Errors</title>
			</Helmet>
			{!integrated && <IntegrationCard />}
			<div
				className={classNames(styles.errorPage, {
					[styles.withoutLeftPanel]: !showLeftPanel,
					[styles.empty]:
						!error_secure_id ||
						errorQueryingErrorGroup ||
						errorQueryingRecentErrors,
				})}
			>
				<div
					className={classNames(styles.errorPageLeftColumn, {
						[styles.hidden]: !showLeftPanel,
					})}
				>
					<ErrorSearchPanel />
				</div>
				<ErrorCreateCommentModal
					show={showCreateCommentModal}
					onClose={() =>
						setShowCreateCommentModal(CreateModalType.None)
					}
					data={data}
				/>
				{error_secure_id && !errorQueryingErrorGroup ? (
					<>
						<Helmet>
							<title>
								Errors:{' '}
								{getHeaderFromError(
									data?.error_group?.event ?? [],
								)}
							</title>
						</Helmet>
						<div
							className={classNames(
								styles.errorPageCenterColumn,
								{
									[styles.hidden]: !showLeftPanel,
									[styles.bannerShown]: showBanner,
								},
							)}
						>
							<div className={styles.titleContainer}>
								{loading ? (
									<Skeleton
										count={1}
										style={{ width: 300, height: 37 }}
									/>
								) : (
									<ErrorTitle
										errorGroup={data?.error_group}
									/>
								)}
							</div>
							<div
								className={classNames(
									styles.eventText,
									styles.sectionRow,
									styles.fieldWrapper,
								)}
							>
								{loading ? (
									<Skeleton
										count={1}
										style={{
											height: '2ch',
											marginBottom: 0,
										}}
									/>
								) : (
									<ErrorBody errorGroup={data?.error_group} />
								)}
								{recentErrorsLoading ? (
									<Skeleton
										count={1}
										style={{
											height: '2ch',
											marginBottom: 0,
										}}
									/>
								) : (
									<ErrorContext
										errorGroupData={recentErrorsData}
									/>
								)}
							</div>
							{loading ? (
								<Skeleton
									count={1}
									style={{
										height: '2ch',
										marginBottom: 0,
									}}
								/>
							) : (
								<div
									className={classNames(
										styles.sectionRow,
										styles.fieldWrapper,
									)}
								>
									<div className={styles.sectionItem}>
										<ErrorDistributionChart
											errorGroup={data?.error_group}
											field="browser"
											title="Browser Distribution"
										/>
									</div>
									<div className={styles.sectionItem}>
										<ErrorDistributionChart
											errorGroup={data?.error_group}
											field="os"
											title="OS Distribution"
										/>
									</div>
								</div>
							)}
							<h3 className={styles.titleWithAction}>
								Stack Trace
								<Tooltip title="Download the stack trace">
									<Button
										trackingId="DownloadErrorStackTrace"
										iconButton
										type="text"
										disabled={loading}
										onClick={() => {
											if (data?.error_group) {
												let stackTraceStr =
													data.error_group
														.stack_trace || ''
												let isJson = true

												if (
													data.error_group
														.structured_stack_trace
														?.length > 0
												) {
													const traceLines =
														data.error_group.structured_stack_trace.map(
															(stack_trace) => {
																return `${stack_trace?.fileName} in ${stack_trace?.functionName} at line ${stack_trace?.lineNumber}:${stack_trace?.columnNumber}`
															},
														)
													stackTraceStr =
														JSON.stringify(
															traceLines,
															undefined,
															2,
														)
												} else {
													try {
														JSON.parse(
															stackTraceStr,
														)
													} catch {
														isJson = false
													}
												}

												const a =
													document.createElement('a')
												const file = new Blob(
													[stackTraceStr],
													{
														type: isJson
															? 'application/json'
															: 'text/plain',
													},
												)

												a.href =
													URL.createObjectURL(file)
												a.download = `stack-trace-for-error-${error_secure_id}.${
													isJson ? 'json' : 'txt'
												}`
												a.click()

												URL.revokeObjectURL(a.href)
											}
										}}
									>
										<SvgDownloadIcon />
									</Button>
								</Tooltip>
							</h3>
							<div className={styles.fieldWrapper}>
								<StackTraceSection
									loading={loading}
									errorGroup={data?.error_group}
								/>
							</div>
							{loading && (
								<h3>
									<Skeleton
										duration={1}
										count={1}
										style={{ width: 300 }}
									/>
								</h3>
							)}
							{!loading && data?.error_group?.project_id && (
								<div className={styles.fieldWrapper}>
									<ErrorFrequencyGraph
										errorGroup={data?.error_group}
									/>
								</div>
							)}
						</div>
						<div
							className={classNames(styles.errorPageRightColumn, {
								[styles.bannerShown]: showBanner,
							})}
							ref={newCommentModalRef}
						>
							<div className={styles.rightButtonsContainer}>
								<ErrorCommentButton
									onClick={() =>
										setShowCreateCommentModal(
											CreateModalType.Issue,
										)
									}
									trackingId="CreateErrorIssue"
								>
									<SvgBugIcon />
									<span>Issue</span>
								</ErrorCommentButton>
								<ErrorShareButton
									errorGroup={data?.error_group}
									style={{ width: '100%' }}
								/>
							</div>
							<ErrorAffectedUsers
								recentErrors={recentErrorsData}
								loading={recentErrorsLoading}
								state={data?.error_group?.state}
							/>
							<ErrorRightPanel
								errorGroup={data}
								recentErrors={recentErrorsData}
								recentErrorsLoading={recentErrorsLoading}
								deepLinkedCommentId={deepLinkedCommentId}
								parentRef={newCommentModalRef}
								onClickCreateComment={() => {
									setShowCreateCommentModal(
										CreateModalType.Comment,
									)
								}}
							/>
						</div>
					</>
				) : errorQueryingErrorGroup || errorQueryingRecentErrors ? (
					<ErrorState
						shownWithHeader
						message="This error does not exist or has not been made public."
					/>
				) : (
					<NoActiveErrorCard />
				)}
			</div>
		</>
	)
}

type FrequencyGraphProps = {
	errorGroup?: Maybe<Pick<ErrorGroup, 'secure_id' | 'project_id'>>
}

type ErrorFrequency = {
	date: string
	occurrences: number
}

const LookbackPeriod = 60

const timeFilter = [
	{ label: 'Last 24 hours', value: 2 },
	{ label: 'Last 7 days', value: 7 },
	{ label: 'Last 30 days', value: 30 },
	{ label: 'Last 90 days', value: 90 },
	{ label: 'This year', value: 30 * 12 },
] as const

export const ErrorFrequencyGraph: React.FC<
	React.PropsWithChildren<FrequencyGraphProps>
> = ({ errorGroup }) => {
	const [errorFrequency, setErrorFrequency] = useState<{
		errorDates: Array<ErrorFrequency>
		totalErrors: number
	}>({
		errorDates: Array(LookbackPeriod).fill(0),
		totalErrors: 0,
	})
	const [dateRangeLength, setDateRangeLength] = useState<number>(
		timeFilter[2].value,
	)

	useEffect(() => {
		setErrorFrequency({
			errorDates: Array(dateRangeLength).fill(0),
			totalErrors: 0,
		})
	}, [dateRangeLength])

	useGetDailyErrorFrequencyQuery({
		variables: {
			project_id: `${errorGroup?.project_id}`,
			error_group_secure_id: `${errorGroup?.secure_id}`,
			date_offset: dateRangeLength - 1,
		},
		skip: !errorGroup,
		onCompleted: (response) => {
			const errorData = response.dailyErrorFrequency.map((val, idx) => ({
				date: moment()
					.startOf('day')
					.subtract(dateRangeLength - 1 - idx, 'days')
					.format('D MMM YYYY'),
				occurrences: val,
			}))
			setErrorFrequency({
				errorDates: errorData,
				totalErrors: response.dailyErrorFrequency.reduce(
					(acc, val) => acc + val,
					0,
				),
			})
		},
	})

	return (
		<>
			<div
				className={classNames(
					styles.titleWithAction,
					styles.titleWithMargin,
				)}
			>
				<h3>Error Frequency</h3>
				<StandardDropdown
					data={timeFilter}
					defaultValue={timeFilter[2]}
					onSelect={setDateRangeLength}
					disabled={!errorGroup}
				/>
			</div>
			<div className={classNames(styles.section, styles.graphSection)}>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart
						width={500}
						height={300}
						data={errorFrequency.errorDates}
						margin={{
							top: 5,
							right: 10,
							left: 10,
							bottom: 0,
						}}
					>
						<CartesianGrid stroke="#D9D9D9" vertical={false} />
						<XAxis
							dataKey="date"
							tick={false}
							axisLine={{ stroke: '#D9D9D9' }}
						/>
						<YAxis
							tickCount={10}
							interval="preserveStart"
							allowDecimals={false}
							hide={true}
						/>
						<RechartsTooltip content={<RechartTooltip />} />
						<Bar dataKey="occurrences" radius={[2, 2, 0, 0]}>
							{errorFrequency.errorDates.map((e, i) => (
								<Cell
									key={i}
									fill={
										e.occurrences >
										Math.max(
											errorFrequency.totalErrors * 0.1,
											10,
										)
											? 'var(--color-red-500)'
											: 'var(--color-brown)'
									}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
				<div className={styles.graphLabels}>
					<div>{`Total Occurrences: ${errorFrequency.totalErrors}`}</div>
				</div>
			</div>
		</>
	)
}

export const getHeaderFromError = (
	errorMsg: Maybe<string>[] | undefined,
): string => {
	const eventText = parseErrorDescriptionList(errorMsg)[0]
	let title = ''
	// Try to get the text in the form Text: ....
	const splitOnColon = eventText?.split(':') ?? []
	if (
		splitOnColon.length &&
		(!splitOnColon[0].includes(' ') ||
			splitOnColon[0].toLowerCase().includes('error'))
	) {
		return splitOnColon[0]
	}
	// Try to get text in the form "'Something' Error" in the event.
	const split = eventText?.split(' ') ?? []
	let prev = ''
	for (let i = 0; i < split?.length; i++) {
		const curr = split[i]
		if (curr.toLowerCase().includes('error')) {
			title = (prev ? prev + ' ' : '') + curr
			return title
		}
		prev = curr
	}

	return errorMsg?.join() ?? ''
}

export default ErrorPage
