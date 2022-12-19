import {
	Box,
	Button,
	Form,
	IconSearch,
	IconSwitchHorizontal,
	MenuButton,
	Tabs,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useWindowSize } from '@hooks/useWindowSize'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useDevToolsContext } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext'
import { NetworkPage } from '@pages/Player/Toolbar/DevToolsWindowV2/NetworkPage/NetworkPage'
import PerformancePage from '@pages/Player/Toolbar/DevToolsWindowV2/PerformancePage/PerformancePage'
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
import useLocalStorage from '@rehooks/local-storage'
import React, { useState } from 'react'

import { ConsolePage } from './ConsolePage/ConsolePage'
import ErrorsPage from './ErrorsPage/ErrorsPage'
import * as styles from './style.css'

const DevToolsWindowV2: React.FC<
	React.PropsWithChildren & {
		width: number
	}
> = (props) => {
	const { openDevTools } = useDevToolsContext()
	const { isPlayerFullscreen } = usePlayerUIContext()
	const { time } = useReplayerContext()
	const [filter, setFilter] = useState('')
	const [tab, setTab] = React.useState<Tab>(Tab.Console)
	const [requestType, setRequestType] = React.useState<RequestType>(
		RequestType.All,
	)
	const [searchShown, setSearchShown] = React.useState<boolean>(false)
	const [logLevel, setLogLevel] = React.useState<LogLevel>(LogLevel.All)
	const [autoScroll, setAutoScroll] = useLocalStorage<boolean>(
		'highlight-devtools-v2-autoscroll',
		false,
	)
	const { height } = useWindowSize()
	const maxHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, height / 2)
	const defaultHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, maxHeight / 2)

	if (!openDevTools || isPlayerFullscreen) {
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
				<Box>
					<div
						className={styles.devToolsWindowV2}
						ref={panelRef}
						style={{ width: props.width }}
					>
						<div className="absolute flex justify-center align-middle">
							<button
								className="flex cursor-ns-resize justify-center border-none bg-transparent p-2 outline-none"
								ref={handleRef}
							>
								<div className="relative h-2 w-10 rounded-full bg-gray-200" />
							</button>
						</div>
						<Tabs<Tab>
							onChange={(t: Tab) => {
								setTab(t)
								setFilter('')
							}}
							pages={{
								[Tab.Errors]: {
									page: (
										<ErrorsPage
											autoScroll={autoScroll}
											filter={filter}
											time={time}
										/>
									),
								},
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
								[Tab.Network]: {
									page: (
										<NetworkPage
											autoScroll={autoScroll}
											requestType={requestType}
											filter={filter}
											time={time}
										/>
									),
								},
								[Tab.Performance]: {
									page: (
										<PerformancePage currentTime={time} />
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
										<Form>
											<label>
												<Box
													display="flex"
													justifyContent="space-between"
													align="center"
												>
													<Box
														display="flex"
														align="center"
														onClick={() => {
															setSearchShown(
																(s) => !s,
															)
														}}
													>
														<IconSearch
															color={
																colors.neutral300
															}
															size={16}
														/>
													</Box>
													<Form.Input
														id="search"
														name="Search"
														placeholder="Search"
														size="xSmall"
														collapsed={!searchShown}
														onChange={(e) =>
															setFilter(
																e.target.value,
															)
														}
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
											</label>
										</Form>

										{tab === Tab.Console ? (
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
										) : tab === Tab.Network ? (
											<MenuButton
												size="medium"
												options={Object.values(
													RequestType,
												).map((rt: string) => ({
													key: rt,
													render: rt,
												}))}
												onChange={(rt: string) =>
													setRequestType(
														rt as RequestType,
													)
												}
											/>
										) : null}

										<Button
											size="xSmall"
											cssClass={styles.autoScroll}
											iconRight={
												<IconSwitchHorizontal
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
										>
											Auto scroll
										</Button>
									</Box>
								</Box>
							}
						/>
					</div>
				</Box>
			)}
		</ResizePanel>
	)
}

export default DevToolsWindowV2
