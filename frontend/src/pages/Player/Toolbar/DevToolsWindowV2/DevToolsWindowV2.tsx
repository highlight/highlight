import { Button } from '@components/Button'
import { LogSource } from '@graph/schemas'
import { LogLevel } from '@graph/schemas'
import {
	Box,
	Callout,
	Form,
	IconSolidLogs,
	IconSolidSearch,
	IconSolidSwitchHorizontal,
	MenuButton,
	Tabs,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
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
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import useLocalStorage from '@rehooks/local-storage'
import clsx from 'clsx'
import React from 'react'
import { Link } from 'react-router-dom'

import { useLinkLogCursor } from '@/pages/Player/PlayerHook/utils'
import { styledVerticalScrollbar } from '@/style/common.css'

import { ConsolePage } from './ConsolePage/ConsolePage'
import ErrorsPage from './ErrorsPage/ErrorsPage'
import { RequestStatusFilter } from './RequestStatusFilter/RequestStatusFilter'
import { RequestTypeFilter } from './RequestTypeFilter/RequestTypeFilter'
import * as styles from './style.css'

const LogLevelValues = [
	'All',
	LogLevel.Trace,
	LogLevel.Debug,
	LogLevel.Info,
	LogLevel.Warn,
	LogLevel.Error,
	LogLevel.Fatal,
] as const

const LogSourceValues = ['All', LogSource.Frontend, LogSource.Backend] as const

const DevToolsWindowV2: React.FC<
	React.PropsWithChildren & {
		width: number
	}
> = (props) => {
	const { projectId } = useProjectId()
	const { logCursor } = useLinkLogCursor()
	const { isPlayerFullscreen } = usePlayerUIContext()
	const { isLiveMode, setIsLiveMode, time, session } = useReplayerContext()
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

	const [searchShown, setSearchShown] = React.useState<boolean>(false)
	const [levels, setLevels] = React.useState<LogLevel[]>([])
	const [sources, setSources] = React.useState<LogSource[]>(
		logCursor ? [] : [LogSource.Frontend],
	)
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

	const { resources: parsedResources } = useResourcesContext()

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
					<Box
						ref={handleRef}
						p="4"
						style={{ cursor: 'grab', width: 'auto' }}
					>
						<Box
							style={{
								backgroundColor: themeVars.static.divider.weak,
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
										The devtools are not available in live
										mode. You can disable live mode to use
										the devtools.
									</Text>

									<Box display="flex" gap="6">
										<Button
											kind="secondary"
											emphasis="high"
											onClick={() => setIsLiveMode(false)}
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
						<Tabs<Tab>
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
											logCursor={logCursor}
											levels={levels}
											sources={sources}
											filter={filter}
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
											requestTypes={requestTypes}
											requestStatuses={requestStatuses}
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
												<Box gap="6">
													<Form.Input
														name={form.names.search}
														placeholder="Search"
														size="xSmall"
														outline={false}
														collapsed={!searchShown}
														onKeyDown={(e: any) => {
															if (
																e.code ===
																'Escape'
															) {
																e.target?.blur()
															}
														}}
														onBlur={() => {
															setSearchShown(
																false,
															)
														}}
														onFocus={() => {
															setSearchShown(true)
														}}
													/>
												</Box>
											</Box>
										</Form>

										{selectedDevToolsTab === Tab.Console ? (
											<>
												<MenuButton
													divider
													size="medium"
													options={LogLevelValues.map(
														(level) => ({
															key: level,
															render: (
																<Text case="capital">
																	{level}
																</Text>
															),
														}),
													)}
													onChange={(level) => {
														if (level === 'All') {
															setLevels([])
														} else {
															setLevels([
																level as LogLevel,
															])
														}
													}}
												/>
												<MenuButton
													divider
													size="medium"
													selectedKey={
														sources.includes(
															LogSource.Frontend,
														)
															? LogSource.Frontend
															: 'All'
													}
													options={LogSourceValues.map(
														(source) => ({
															key: source,
															render: (
																<Text case="capital">
																	{source}
																</Text>
															),
														}),
													)}
													onChange={(source) => {
														if (source === 'All') {
															setSources([])
														} else {
															setSources([
																source as LogSource,
															])
														}
													}}
												/>
											</>
										) : selectedDevToolsTab ===
										  Tab.Network ? (
											<>
												<RequestTypeFilter
													requestTypes={requestTypes}
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
													requestTypes={requestTypes}
												/>
											</>
										) : null}

										{selectedDevToolsTab === Tab.Console &&
										session ? (
											<Link
												to={getLogsURLForSession({
													projectId,
													session,
													levels,
													sources,
												})}
												target="_blank"
												style={{ display: 'flex' }}
											>
												<Button
													size="xSmall"
													kind="secondary"
													trackingId="showInLogViewer"
													cssClass={styles.autoScroll}
													iconLeft={
														<IconSolidLogs
															width={12}
															height={12}
														/>
													}
												>
													Show in Log Viewer
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
												autoScroll
													? 'primary'
													: 'secondary'
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
					)}
				</Box>
			)}
		</ResizePanel>
	)
}

export default DevToolsWindowV2
