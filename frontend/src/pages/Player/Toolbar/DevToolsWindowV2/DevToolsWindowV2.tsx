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
import useLocalStorage from '@rehooks/local-storage'
import clsx from 'clsx'
import React from 'react'
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
	const { time } = useReplayerContext()
	const [tab, setTab] = React.useState<Tab>(Tab.Console)
	const [requestType, setRequestType] = React.useState<RequestType>(
		RequestType.All,
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
						tab={tab}
						setTab={(t: Tab) => {
							setTab(t)
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
