import { Button } from '@components/Button'
import { LogSource, ProductType } from '@graph/schemas'
import {
	Box,
	Callout,
	Form,
	IconSolidLogs,
	IconSolidSearch,
	IconSolidSwitchHorizontal,
	IconSolidTraces,
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
import { TracesPage } from './TracesPage/TracesPage'
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
	const logSearch = logCursor ? LOG_CURSOR_LOG_SEARCH : DEFAULT_LOG_SEARCH
	const traceSearch = session?.service_name
		? `service_name=${session?.service_name}`
		: ''
	const [query, setQuery] = React.useState<string>(
		selectedDevToolsTab === Tab.Console ? logSearch : traceSearch,
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
		query: query,
	})

	const showSearchComponent =
		selectedDevToolsTab === Tab.Performance
			? false
			: selectedDevToolsTab === Tab.Console ||
				  selectedDevToolsTab === Tab.Traces
				? 'basic'
				: 'custom'

	const handleShowInViewer = () => {
		set({
			type: selectedDevToolsTab === Tab.Console ? 'logs' : 'traces',
			query: params.query,
			startDate: params.date_range.start_date.toISOString(),
			endDate: params.date_range.end_date.toISOString(),
		})
	}

	return (
		<ResizePanel
			defaultHeight={defaultHeight}
			minHeight={DEV_TOOLS_MIN_HEIGHT}
			maxHeight={maxHeight}
			heightPersistenceKey="highlight-devToolsPanelHeight"
		>
			{({ panelRef, handleRef, panelHeight }) => (
				<SearchContext initialQuery={query} onSubmit={setQuery}>
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
								selectedId={selectedDevToolsTab}
								onChange={(id) => {
									setSelectedDevToolsTab(id as Tab)
									setQuery(
										(id as Tab) === Tab.Console
											? logSearch
											: traceSearch,
									)
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
												<Tabs.Tab id={Tab.Traces}>
													Traces
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

										{showSearchComponent ===
										false ? null : (
											<Stack
												borderTop="dividerWeak"
												direction="row"
												gap="4"
												py={
													showSearchComponent ===
													'custom'
														? '8'
														: '0'
												}
												alignItems="center"
											>
												{showSearchComponent ===
												'basic' ? (
													<>
														<Search
															startDate={params.date_range.start_date.toDate()}
															endDate={params.date_range.end_date.toDate()}
															placeholder="Search..."
															productType={
																selectedDevToolsTab ===
																Tab.Console
																	? ProductType.Logs
																	: ProductType.Traces
															}
														/>
														<Button
															size="xSmall"
															kind="secondary"
															trackingId="session_show-in-viewer_click"
															cssClass={
																styles.autoScroll
															}
															iconLeft={
																selectedDevToolsTab ===
																Tab.Console ? (
																	<IconSolidLogs
																		width={
																			12
																		}
																		height={
																			12
																		}
																	/>
																) : (
																	<IconSolidTraces
																		width={
																			12
																		}
																		height={
																			12
																		}
																	/>
																)
															}
															onClick={
																handleShowInViewer
															}
														>
															Show in viewer
														</Button>
													</>
												) : (
													<>
														<Box
															display="flex"
															width="full"
														>
															<Form
																store={
																	formStore
																}
																style={{
																	display:
																		'flex',
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
										)}
									</Stack>
								</Tabs.List>
								<Tabs.Panel
									id={Tab.Console}
									tabId={Tab.Console}
								>
									<ConsolePage
										autoScroll={autoScroll}
										filter={filter}
										query={query}
										panelHeight={panelHeight}
									/>
								</Tabs.Panel>
								<Tabs.Panel id={Tab.Errors} tabId={Tab.Errors}>
									<ErrorsPage
										autoScroll={autoScroll}
										filter={filter}
										time={time}
									/>
								</Tabs.Panel>
								<Tabs.Panel
									id={Tab.Network}
									tabId={Tab.Network}
								>
									<NetworkPage
										autoScroll={autoScroll}
										requestTypes={requestTypes}
										requestStatuses={requestStatuses}
										filter={filter}
										time={time}
									/>
								</Tabs.Panel>
								<Tabs.Panel id={Tab.Traces} tabId={Tab.Traces}>
									<TracesPage
										autoScroll={autoScroll}
										filter={filter}
										query={query}
										panelHeight={panelHeight}
									/>
								</Tabs.Panel>
								<Tabs.Panel
									id={Tab.Performance}
									style={{ height: '100%' }}
									tabId={Tab.Performance}
								>
									<PerformancePage />
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
