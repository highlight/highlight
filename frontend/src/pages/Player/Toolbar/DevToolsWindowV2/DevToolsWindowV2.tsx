import { Button } from '@components/Button'
import {
	Box,
	Form,
	IconSolidSearch,
	IconSolidSwitchHorizontal,
	MenuButton,
	Tabs,
	useFormState,
} from '@highlight-run/ui'
import { useWindowSize } from '@hooks/useWindowSize'
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
	ICountPerRequestStatus,
	ICountPerRequestType,
	LogLevel,
	LogLevelVariants,
	NetworkResource,
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import useLocalStorage from '@rehooks/local-storage'
import clsx from 'clsx'
import React, { useMemo } from 'react'
import { styledVerticalScrollbar } from 'style/common.css'

import { ConsolePage } from './ConsolePage/ConsolePage'
import ErrorsPage from './ErrorsPage/ErrorsPage'
import * as styles from './style.css'

const DevToolsWindowV2: React.FC<
	React.PropsWithChildren & {
		width: number
	}
> = (props) => {
	const { isPlayerFullscreen } = usePlayerUIContext()
	const { time, sessionMetadata } = useReplayerContext()
	const startTime = sessionMetadata.startTime
	const { selectedDevToolsTab, setSelectedDevToolsTab } =
		usePlayerConfiguration()

	const [requestType, setRequestType] = React.useState<RequestType[]>([
		RequestType.All,
	]) // DEV - init value probably needs to change once multi-select enabled
	const [requestStatus, setRequestStatus] = React.useState<RequestStatus[]>([
		RequestStatus.All,
	]) // DEV - init value probably needs to change once multi-select enabled
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

	/* Filter on RequestType[] and RequestStatus[] */
	const resourcesToRender = useMemo(() => {
		const current =
			(parsedResources
				/* Filter on RequestType */
				.filter(
					(request) =>
						requestType.includes(RequestType.All) ||
						requestType.includes(
							request.initiatorType as RequestType,
						),
				)
				.filter((request) => {
					/* No filter for RequestStatus.All */
					if (requestStatus.includes(RequestStatus.All)) {
						return true
					}
					/* Filter on RequestStatus */
					const status =
						request?.requestResponsePairs?.response?.status
					if (status) {
						const statusString = status.toString()
						/* First char match: '1', '2', '3', '4', '5', '?' */
						if (requestStatus[0] === statusString[0]) {
							return true
						}
					}
					return false
				})
				.map((event) => ({
					...event,
					timestamp: event.startTime + startTime,
				})) as NetworkResource[]) ?? []

		if (filter !== '') {
			return current.filter((resource) => {
				if (!resource.name) {
					return false
				}

				return (resource.displayName || resource.name)
					.toLocaleLowerCase()
					.includes(filter.toLocaleLowerCase())
			})
		}

		return current
	}, [parsedResources, filter, requestType, requestStatus, startTime])

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

		resourcesToRender.forEach((request) => {
			const requestType =
				request.initiatorType as keyof ICountPerRequestType

			/* Only count request types defined in ICountPerRequestType, e.g. skip 'beacon' */
			if (count.hasOwnProperty(request.initiatorType)) {
				count['All'] += 1
				count[requestType] += 1
			}
		})

		return count
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resourcesToRender])

	/* Count request per http status (200, etc.) */
	const countPerRequestStatus = useMemo(() => {
		const count: ICountPerRequestStatus = {
			All: 0,
			'1XX': 0,
			'2XX': 0,
			'3XX': 0,
			'4XX': 0,
			'5XX': 0,
			'???': 0,
		}

		resourcesToRender.forEach((request) => {
			/* Only counting http status for types 'Fetch' and 'XHR' */
			if (['fetch', 'xmlhttprequest'].includes(request.initiatorType)) {
				const status: number | undefined =
					request?.requestResponsePairs?.response?.status

				if (status) {
					count['All'] += 1
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
							count['???'] += 1
							break
					}
				} else {
					count['???'] += 1 /* if no 'status' value */
				}
			}
		})

		return count
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resourcesToRender])

	//--
	// Object.entries(RequestStatus).map(([statusKey, statusValue]) => ({
	// 	checked: requestStatus.includes(statusKey as RequestStatus)
	// 	onChange: (e) => {
	// 		/* e.target.checked is the status (boolean) after the click */
	// 		e.target.checked ?
	// 		/* add to state */
	// 		setRequestStatus((state) => { return {...state, statusKey}}) :
	// 		/* remove from state */
	// 		setRequestStatus((state) => {
	// 			return {
	// 				...state.filter((x) => x !== statusKey)
	// 			}
	// 		})
	// 		// add statusKey to requestStatus array
	// 	},
	// 	label: `${statusKey} (${countPerRequestStatus?.[statusValue] ?? 0})`,
	// 	key: statusKey,
	// }))
	//--

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
										filter={filter}
										time={time}
										requestType={requestType}
										requestStatus={requestStatus}
										resourcesToRender={resourcesToRender}
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
											{/* <CheckboxList
												checkboxOptions={Object.entries(
													RequestStatus,
												).map(
													([
														statusKey,
														statusValue,
													]) => ({
														checked:
															requestStatus.includes(
																statusKey as RequestStatus,
															),
														onChange: (e) => {
															e.target.checked
																  setRequestStatus(
																		(
																			state,
																		) => {
																			return {
																				...state,
																				statusKey,
																			}
																		},
																  )
																  setRequestStatus(
																		(
																			state,
																		) => {
																			return {
																				...state.filter(
																					(
																						x,
																					) =>
																						x !==
																						statusKey,
																				),
																			}
																		},
																  )
														},
														label: `${statusKey} (${
															countPerRequestStatus?.[
																statusValue
															] ?? 0
														})`,
														key: statusKey,
													}),
												)}
											/> */}
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
														render: `${statusKey} (${
															countPerRequestStatus?.[
																statusValue
															] ?? 0
														})`,
													}),
												)}
												onChange={(statusKey) => {
													// DEV - need to be able to add and remove to have mutli-select functionality
													// Checkboxes?
													setRequestStatus(
														(state) => {
															return [
																...state,
																RequestStatus[
																	statusKey as keyof typeof RequestStatus
																],
															]
														},
													)
												}}
											/>
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
														render: `${displayName} (${
															countPerRequestType?.[
																requestName
															] ?? 0
														})`,
													}),
												)}
												onChange={(displayName) => {
													// DEV - need to be able to add and remove to have mutli-select functionality
													// Checkboxes?
													setRequestType((state) => {
														return [
															...state,
															RequestType[
																displayName as keyof typeof RequestType
															],
														]
													})
												}}
											/>
										</>
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
