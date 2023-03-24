import { Button } from '@components/Button'
// import { MultiSelect } from '@components/MultiSelect/MultiSelect'
import { Listbox } from '@headlessui/react'
import {
	Badge,
	Box,
	Form,
	IconSolidCheckCircle,
	IconSolidSearch,
	IconSolidSwitchHorizontal,
	IconSolidViewList,
	MenuButton,
	Tabs,
	Text,
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
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { ICountPerRequestType } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
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
	const [requestTypes, setRequestTypes] = React.useState<RequestType[]>([])
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

			//-- Only count request types defined in ICountPerRequestType, e.g. skip 'beacon' --//
			if (count.hasOwnProperty(request.initiatorType)) {
				count['All'] += 1
				count[requestType] += 1
			}
		})

		return count
	}, [parsedResources])

	if (!showDevTools || isPlayerFullscreen) {
		return null
	}

	console.log(requestTypes.length) // DEV
	console.log(requestTypes) // DEV

	const requestTypeButton = () => {
		let text

		if (requestTypes.length === 0) {
			text = 'Type'
		} else if (requestTypes.length === 1) {
			text = requestTypes[0]
		} else if (requestTypes.length === 2) {
			text = requestTypes.join(', ')
		} else if (requestTypes.length > 2) {
			text = `${requestTypes.length} types`
		}

		return <Text size="medium">{text}</Text>
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
										requestTypes={requestTypes}
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
											<Listbox
												value={requestTypes}
												onChange={(event) => {
													console.log(event) // DEV
													setRequestTypes(event)
												}}
												multiple
											>
												<Listbox.Button>
													{requestTypeButton}
												</Listbox.Button>
												<Listbox.Options>
													{Object.entries(
														RequestType,
													).map(
														([
															displayName,
															requestName,
														]) => (
															<Listbox.Option
																key={
																	requestName
																}
																value={
																	requestName
																}
																as={
																	React.Fragment
																}
															>
																{({
																	active,
																	selected,
																}) => (
																	<Box display="flex">
																		{selected && (
																			<IconSolidCheckCircle />
																		)}
																		<Text size="medium">
																			{
																				requestName
																			}
																		</Text>
																		<Badge
																			label={countPerRequestType[
																				requestName
																			].toString()}
																		/>
																	</Box>
																)}
															</Listbox.Option>
														),
													)}
												</Listbox.Options>
											</Listbox>
											{/* <MultiSelect
												options={Object.entries(
													RequestType,
												).map(
													([
														displayName,
														requestName,
													]) => ({
														id: requestName,
														name: displayName,
														count: countPerRequestType[
															requestName
														],
													}),
												)}
												selected={requestType}
												setSelected={setRequestType}
												showCancel={true}
											/> */}
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
