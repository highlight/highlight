import { Button } from '@components/Button'
import { LogSource, ProductType } from '@graph/schemas'
import {
	Box,
	Callout,
	Form,
	IconSolidLogs,
	IconSolidSearch,
	IconSolidSwitchHorizontal,
	Stack,
	Tabs,
	Text,
} from '@highlight-run/ui/components'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import { themeVars } from '@highlight-run/ui/theme'
import { useWindowSize } from '@hooks/useWindowSize'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import PerformancePage from '@pages/Player/Toolbar/DevToolsWindowV2/PerformancePage/PerformancePage'
import {
	DEV_TOOLS_MIN_HEIGHT,
	ResizePanel,
} from '@pages/Player/Toolbar/DevToolsWindowV2/ResizePanel'
import {
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import useLocalStorage from '@rehooks/local-storage'
import clsx from 'clsx'
import React from 'react'

import { buildSessionParams } from '@/pages/LogsPage/utils'
import { useLinkLogCursor } from '@/pages/Player/PlayerHook/utils'
import ErrorsPage from '@/pages/Player/Toolbar/DevToolsWindowV2/ErrorsPage/ErrorsPage'
import { NetworkPage } from '@/pages/Player/Toolbar/DevToolsWindowV2/NetworkPage/NetworkPage'
import { RequestStatusFilter } from '@/pages/Player/Toolbar/DevToolsWindowV2/RequestStatusFilter/RequestStatusFilter'
import { RequestTypeFilter } from '@/pages/Player/Toolbar/DevToolsWindowV2/RequestTypeFilter/RequestTypeFilter'
import { styledVerticalScrollbar } from '@/style/common.css'
import { SearchContext } from '@/components/Search/SearchContext'
import { useRelatedResource } from '@/components/RelatedResources/hooks'

import { ConsolePage } from './ConsolePage/ConsolePage'
import * as styles from './style.css'

const DEFAULT_LOG_SEARCH = `source=${LogSource.Frontend} `
const LOG_CURSOR_LOG_SEARCH = `source=(${LogSource.Frontend} OR ${LogSource.Backend})`

const DevToolsWindowV2: React.FC<
	React.PropsWithChildren & {
		width: number
	}
> = (props) => {
	const { logCursor } = useLinkLogCursor()
	const { isPlayerFullscreen } = usePlayerUIContext()
	const { isLiveMode, setIsLiveMode, time, session } = useReplayerContext()
	const { set } = useRelatedResource()
	const {
		selectedDevToolsTab,
		setSelectedDevToolsTab,
		showDevTools,
		showHistogram,
		setShowDevTools,
	} = usePlayerConfiguration()
	const [requestTypes, setRequestTypes] = React.useState<RequestType[]>([
		RequestType.All,
	])
	const [requestStatuses, setRequestStatuses] = React.useState<
		RequestStatus[]
	>([RequestStatus.All])
	const [logQuery, setLogQuery] = React.useState<string>(
		logCursor ? LOG_CURSOR_LOG_SEARCH : DEFAULT_LOG_SEARCH,
	)

	const formStore = Form.useStore({
		defaultValues: {
			search: '',
		},
	})
	const filter = formStore.useValue<string>('search')
	const [autoScroll, setAutoScroll] = useLocalStorage<boolean>(
		'highlight-devtools-v2-autoscroll',
		false,
	)
	const { height } = useWindowSize()
	const maxHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, height / 2)
	const defaultHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, maxHeight / 2)

	const { resources: parsedResources } = useResourcesContext()

	if (!showDevTools || isPlayerFullscreen) {
		return null
	}

	const params = buildSessionParams({
		session,
		query: logQuery,
	})

	const showSearchComponent = selectedDevToolsTab === Tab.Console

	return (
		<ResizePanel
			defaultHeight={defaultHeight}
			minHeight={DEV_TOOLS_MIN_HEIGHT}
			maxHeight={maxHeight}
			heightPersistenceKey="highlight-devToolsPanelHeight"
		>
			{({ panelRef, handleRef, panelHeight }) => (
				<SearchContext initialQuery={logQuery} onSubmit={setLogQuery}>
					<Box
						bt={showHistogram ? undefined : 'dividerWeak'}
						cssClass={clsx(
							styles.devToolsWindowV2,
							styledVerticalScrollbar,
						)}
						ref={panelRef}
						style={{ width: props.width }}
					>
						<Box
							ref={handleRef}
							p="4"
							style={{ cursor: 'ns-resize', width: 'auto' }}
						>
							<Box
								style={{
									backgroundColor:
										themeVars.static.divider.weak,
									borderRadius: 10,
									height: 4,
									width: 36,
									zIndex: 1,
								}}
							/>
						</Box>
						{isLiveMode ? (
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
								style={{
									height: '100%',
									width: '100%',
								}}
							>
								<Box style={{ maxWidth: 340 }}>
									<Callout
										kind="info"
										title="You’re watching a live session!"
										icon={false}
									>
										<Text>
											The devtools are not available in
											live mode. You can disable live mode
											to use the devtools.
										</Text>

										<Box display="flex" gap="6">
											<Button
												kind="secondary"
												emphasis="high"
												onClick={() =>
													setIsLiveMode(false)
												}
												trackingId="devtools-live-mode-callout_disable"
											>
												Disable live mode
											</Button>
											<Button
												kind="secondary"
												emphasis="medium"
												onClick={() =>
													setShowDevTools(false)
												}
												trackingId="devtools-live-mode-callout_hide-devtools"
											>
												Hide dev tools
											</Button>
										</Box>
									</Callout>
								</Box>
							</Box>
						) : (
							<Tabs
								onChange={(id) => {
									setSelectedDevToolsTab(id as Tab)
									formStore.reset()
								}}
							>
								<Tabs.List px="8">
									<Stack gap="0" width="full">
										<Stack
											direction="row"
											justifyContent="space-between"
											width="full"
										>
											<Stack direction="row">
												<Tabs.Tab id={Tab.Console}>
													Console Logs
												</Tabs.Tab>
												<Tabs.Tab id={Tab.Errors}>
													Errors
												</Tabs.Tab>
												<Tabs.Tab id={Tab.Network}>
													Network
												</Tabs.Tab>
												<Tabs.Tab id={Tab.Performance}>
													Performance
												</Tabs.Tab>
											</Stack>

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
													autoScroll
														? 'primary'
														: 'secondary'
												}
												onClick={() => {
													setAutoScroll(!autoScroll)
												}}
												trackingId="devToolsAutoScroll"
											>
												<Text lines="1">
													Auto scroll
												</Text>
											</Button>
										</Stack>

										<Stack
											borderTop="dividerWeak"
											direction="row"
											gap="4"
											py={showSearchComponent ? '0' : '8'}
											alignItems="center"
										>
											{showSearchComponent ? (
												<>
													<Search
														startDate={params.date_range.start_date.toDate()}
														endDate={params.date_range.end_date.toDate()}
														placeholder="Search..."
														productType={
															ProductType.Logs
														}
													/>
													<Button
														size="xSmall"
														kind="secondary"
														trackingId="session_show-in-log-viewer_click"
														cssClass={
															styles.autoScroll
														}
														iconLeft={
															<IconSolidLogs
																width={12}
																height={12}
															/>
														}
														onClick={() => {
															set({
																type: 'logs',
																query: params.query,
																startDate:
																	params.date_range.start_date.toISOString(),
																endDate:
																	params.date_range.end_date.toISOString(),
															})
														}}
													>
														Show in log viewer
													</Button>
												</>
											) : (
												<>
													<Box
														display="flex"
														width="full"
													>
														<Form
															store={formStore}
															style={{
																display: 'flex',
																width: '100%',
															}}
														>
															<Box
																display="flex"
																justifyContent="flex-start"
																align="center"
																width="full"
																gap="4"
															>
																<Box
																	cursor="pointer"
																	display="flex"
																	align="center"
																	color="weak"
																>
																	<IconSolidSearch
																		size={
																			16
																		}
																	/>
																</Box>
																<Box width="full">
																	<Form.Input
																		name={
																			formStore
																				.names
																				.search
																		}
																		placeholder="Search"
																		size="xSmall"
																		outline={
																			false
																		}
																		width="100%"
																	/>
																</Box>
															</Box>
														</Form>
													</Box>
													<Stack
														direction="row"
														gap="4"
														flexShrink={0}
													>
														{selectedDevToolsTab ===
														Tab.Network ? (
															<>
																<RequestTypeFilter
																	requestTypes={
																		requestTypes
																	}
																	setRequestTypes={
																		setRequestTypes
																	}
																	parsedResources={
																		parsedResources
																	}
																/>
																<RequestStatusFilter
																	requestStatuses={
																		requestStatuses
																	}
																	setRequestStatuses={
																		setRequestStatuses
																	}
																	parsedResources={
																		parsedResources
																	}
																	requestTypes={
																		requestTypes
																	}
																/>
															</>
														) : null}
													</Stack>
												</>
											)}
										</Stack>
									</Stack>
								</Tabs.List>
								<Tabs.Panel id={Tab.Console}>
									<ConsolePage
										autoScroll={autoScroll}
										logCursor={logCursor}
										filter={filter}
										query={logQuery}
										panelHeight={panelHeight}
									/>
								</Tabs.Panel>
								<Tabs.Panel id={Tab.Errors}>
									<ErrorsPage
										autoScroll={autoScroll}
										filter={filter}
										time={time}
									/>
								</Tabs.Panel>
								<Tabs.Panel id={Tab.Network}>
									<NetworkPage
										autoScroll={autoScroll}
										requestTypes={requestTypes}
										requestStatuses={requestStatuses}
										filter={filter}
										time={time}
									/>
								</Tabs.Panel>
								<Tabs.Panel id={Tab.Performance}>
									<PerformancePage time={time} />
								</Tabs.Panel>
							</Tabs>
						)}
					</Box>
				</SearchContext>
			)}
		</ResizePanel>
	)
}

export default DevToolsWindowV2
