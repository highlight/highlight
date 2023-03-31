import { Button } from '@components/Button'
import {
	Box,
	Form,
	IconSolidSearch,
	IconSolidSwitchHorizontal,
	IconSolidViewList,
	MenuButton,
	Tabs,
	useFormState,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useWindowSize } from '@hooks/useWindowSize'
import { getLogsURLForSession } from '@pages/LogsPage/SearchForm/utils'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import { NetworkPage } from '@pages/Player/Toolbar/DevToolsWindowV2/NetworkPage/NetworkPage'
import {
	DEV_TOOLS_MIN_HEIGHT,
	ResizePanel,
} from '@pages/Player/Toolbar/DevToolsWindowV2/ResizePanel'
import {
	LogLevel,
	LogLevelVariants,
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import {
	ICountPerRequestStatus,
	ICountPerRequestType,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import useLocalStorage from '@rehooks/local-storage'
import clsx from 'clsx'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { styledVerticalScrollbar } from 'style/common.css'

import { ConsolePage } from './ConsolePage/ConsolePage'
import ErrorsPage from './ErrorsPage/ErrorsPage'
import * as styles from './style.css'

const DevToolsWindowV2: React.FC<
	React.PropsWithChildren & {
		width: number
	}
> = (props) => {
	const { projectId } = useProjectId()
	const { isPlayerFullscreen } = usePlayerUIContext()
	const { time, session } = useReplayerContext()
	const { selectedDevToolsTab, setSelectedDevToolsTab } =
		usePlayerConfiguration()
	const [requestType, setRequestType] = React.useState<RequestType>(
		RequestType.All,
	)
	const [requestStatus, setRequestStatus] = React.useState<RequestStatus>(
		RequestStatus.All,
	)

	const [searchShown, setSearchShown] = React.useState<boolean>(false)
	const [logLevel, setLogLevel] = React.useState<LogLevel>(LogLevel.All)
	const form = useFormState({
		defaultValues: {
			search: '',
		},
	})
	const filter = form.getValue(form.names.search)
	const [autoScroll, setAutoScroll] = useLocalStorage<boolean>(
		'highlight-devtools-v2-autoscroll',
		false,
	)
	const { height } = useWindowSize()
	const maxHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, height / 2)
	const defaultHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, maxHeight / 2)
	const { showDevTools, showHistogram } = usePlayerConfiguration()

	const { resources: parsedResources } = useResourcesContext()

	/* Count request per type (XHR, etc.) */
	const countPerRequestType = useMemo(() => {
		const count: ICountPerRequestType = {
			All: 0,
			link: 0,
			script: 0,
			other: 0,
			xmlhttprequest: 0,
			css: 0,
			iframe: 0,
			fetch: 0,
			img: 0,
		}

		parsedResources.forEach((request) => {
			const requestType =
				request.initiatorType as keyof ICountPerRequestType

			count['All'] += 1
			/* Only count request types defined in ICountPerRequestType, e.g. skip 'beacon' */
			if (count.hasOwnProperty(request.initiatorType)) {
				count[requestType] += 1
			}
		})

		return count
	}, [parsedResources])

	/* Count request per http status (200, etc.) */
	const countPerRequestStatus = useMemo(() => {
		const count: ICountPerRequestStatus = {
			All: 0,
			'1XX': 0,
			'2XX': 0,
			'3XX': 0,
			'4XX': 0,
			'5XX': 0,
			Unknown: 0,
		}

		parsedResources
			.filter(
				(r) =>
					requestType === RequestType.All ||
					requestType === r.initiatorType,
			)
			.forEach((request) => {
				const status: number | undefined =
					request?.requestResponsePairs?.response?.status

				count['All'] += 1
				if (status) {
					switch (true) {
						case status >= 100 && status < 200:
							count['1XX'] += 1
							break
						case status >= 200 && status < 300:
							count['2XX'] += 1
							break
						case status >= 300 && status < 400:
							count['3XX'] += 1
							break
						case status >= 400 && status < 500:
							count['4XX'] += 1
							break
						case status >= 500 && status < 600:
							count['5XX'] += 1
							break
						default:
							count['Unknown'] += 1
							break
					}
				} else {
					// this is a network request with no status code
					// if fetch, consider unknown. otherwise assume it is 2xx
					if (request.initiatorType === RequestType.Fetch) {
						count['Unknown'] += 1
					} else {
						count['2XX'] += 1
					}
				}
			})

		return count
	}, [parsedResources, requestType])

	if (!showDevTools || isPlayerFullscreen) {
		return null
	}

	return (
		<ResizePanel
			defaultHeight={defaultHeight}
			minHeight={DEV_TOOLS_MIN_HEIGHT}
			maxHeight={maxHeight}
			heightPersistenceKey="highlight-devToolsPanelHeight"
		>
			{({ panelRef, handleRef }) => (
				<Box
					bt={showHistogram ? undefined : 'dividerWeak'}
					cssClass={clsx(
						styles.devToolsWindowV2,
						styledVerticalScrollbar,
					)}
					ref={panelRef}
					style={{ width: props.width }}
				>
					<Tabs<Tab>
						handleRef={handleRef}
						tab={selectedDevToolsTab}
						setTab={(t: Tab) => {
							setSelectedDevToolsTab(t)
							form.reset()
						}}
						pages={{
							[Tab.Console]: {
								page: (
									<ConsolePage
										autoScroll={autoScroll}
										logLevel={logLevel}
										filter={filter}
										time={time}
									/>
								),
							},
							[Tab.Errors]: {
								page: (
									<ErrorsPage
										autoScroll={autoScroll}
										filter={filter}
										time={time}
									/>
								),
							},
							[Tab.Network]: {
								page: (
									<NetworkPage
										autoScroll={autoScroll}
										requestType={requestType}
										requestStatus={requestStatus}
										filter={filter}
										time={time}
									/>
								),
							},
						}}
						right={
							<Box
								display="flex"
								justifyContent="space-between"
								gap="6"
								align="center"
							>
								<Box
									display="flex"
									justifyContent="space-between"
									gap="4"
									align="center"
								>
									<Form state={form}>
										<label>
											<Box
												display="flex"
												justifyContent="space-between"
												align="center"
											>
												<Box
													cursor="pointer"
													display="flex"
													align="center"
													onClick={() => {
														setSearchShown(
															(s) => !s,
														)
													}}
													color="weak"
												>
													<IconSolidSearch
														size={16}
													/>
												</Box>
												<Form.Input
													name={form.names.search}
													placeholder="Search"
													size="xSmall"
													outline={false}
													collapsed={!searchShown}
													onKeyDown={(e: any) => {
														if (
															e.code === 'Escape'
														) {
															e.target?.blur()
														}
													}}
													onBlur={() => {
														setSearchShown(false)
													}}
													onFocus={() => {
														setSearchShown(true)
													}}
												/>
											</Box>
										</label>
									</Form>

									{selectedDevToolsTab === Tab.Console ? (
										<MenuButton
											divider
											size="medium"
											options={Object.values(
												LogLevel,
											).map((ll) => ({
												key: ll,
												render: ll,
												variants: LogLevelVariants[
													ll as keyof typeof LogLevelVariants
												]
													? {
															variant:
																LogLevelVariants[
																	ll as keyof typeof LogLevelVariants
																],
													  }
													: undefined,
											}))}
											onChange={(ll: string) =>
												setLogLevel(ll as LogLevel)
											}
										/>
									) : selectedDevToolsTab === Tab.Network ? (
										<>
											<MenuButton
												size="medium"
												options={Object.entries(
													RequestType,
												).map(
													([
														displayName,
														requestName,
													]) => ({
														key: displayName,
														render: `${displayName} (${countPerRequestType[requestName]})`,
													}),
												)}
												onChange={(displayName) => {
													setRequestType(
														//-- Set type to be the requestName value --//
														RequestType[
															displayName as keyof typeof RequestType
														],
													)
												}}
											/>
											<MenuButton
												size="medium"
												options={Object.entries(
													RequestStatus,
												).map(
													([
														statusKey,
														statusValue,
													]) => ({
														key: statusKey,
														render: `${statusKey} (${countPerRequestStatus[statusValue]})`,
													}),
												)}
												onChange={(statusKey) => {
													setRequestStatus(
														//-- Set type to be the requestName value --//
														RequestStatus[
															statusKey as keyof typeof RequestStatus
														],
													)
												}}
											/>
										</>
									) : null}

									{selectedDevToolsTab === Tab.Console &&
									session ? (
										<Link
											to={getLogsURLForSession(
												projectId,
												session,
											)}
											style={{ display: 'flex' }}
										>
											<Button
												size="xSmall"
												kind="secondary"
												trackingId="relatedLogs"
												cssClass={styles.autoScroll}
												iconLeft={
													<IconSolidViewList
														width={12}
														height={12}
													/>
												}
											>
												Related logs
											</Button>
										</Link>
									) : null}

									<Button
										size="xSmall"
										cssClass={styles.autoScroll}
										iconRight={
											<IconSolidSwitchHorizontal
												width={12}
												height={12}
												className={
													styles.switchInverted
												}
											/>
										}
										kind={
											autoScroll ? 'primary' : 'secondary'
										}
										onClick={() => {
											setAutoScroll(!autoScroll)
										}}
										trackingId="devToolsAutoScroll"
									>
										Auto scroll
									</Button>
								</Box>
							</Box>
						}
					/>
				</Box>
			)}
		</ResizePanel>
	)
}

export default DevToolsWindowV2
