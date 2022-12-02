import {
	Box,
	Button,
	Form,
	IconSearch,
	IconSwitchHorizontal,
	MenuButton,
	SwitchButton,
} from '@highlight-run/ui/src'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useWindowSize } from '@hooks/useWindowSize'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useDevToolsContext } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext'
import {
	DEV_TOOLS_MIN_HEIGHT,
	ResizePanel,
} from '@pages/Player/Toolbar/DevToolsWindowV2/ResizePanel'
import useLocalStorage from '@rehooks/local-storage'
import React, { useState } from 'react'

import { ConsolePage } from './ConsolePage/ConsolePage'
import ErrorsPage from './ErrorsPage/ErrorsPage'
import * as styles from './style.css'

enum Tab {
	Errors = 'Errors',
	Console = 'Console',
	Network = 'Network',
	Performance = 'Performance',
}

export enum LogLevel {
	All = 'All',
	Info = 'Info',
	Log = 'Log',
	Warn = 'Warn',
	Error = 'Error',
}

const DevToolsControlBar: React.FC<
	React.PropsWithChildren & {
		tab: Tab
		setTab: React.Dispatch<React.SetStateAction<Tab>>
		autoScroll: boolean
		setAutoScroll: (autoScroll: boolean) => void
		setLogLevel: React.Dispatch<React.SetStateAction<LogLevel>>
		filter: string
		setFilter: React.Dispatch<React.SetStateAction<string>>
	}
> = (props) => {
	const [searchShown, setSearchShown] = React.useState<boolean>(false)
	return (
		<Box
			px={'8'}
			py={'6'}
			display={'flex'}
			width={'full'}
			justifyContent={'space-between'}
			align={'center'}
			borderBottom={'neutral'}
		>
			<Box gap={'6'} display={'flex'}>
				{[Tab.Errors, Tab.Console, Tab.Network, Tab.Performance].map(
					(t) => (
						<Button
							key={t}
							size={'xSmall'}
							kind={t === props.tab ? 'primary' : 'secondary'}
							className={
								t !== props.tab
									? styles.controlBarButtonDeselected
									: undefined
							}
							onClick={() => {
								props.setTab(t)
							}}
						>
							{Tab[t]}
						</Button>
					),
				)}
			</Box>
			<Box
				display={'flex'}
				justifyContent={'space-between'}
				gap={'6'}
				align={'center'}
			>
				<Box
					display={'flex'}
					justifyContent={'space-between'}
					gap={'4'}
					align={'center'}
				>
					<Form>
						<label>
							<Box
								display={'flex'}
								justifyContent={'space-between'}
								align={'center'}
							>
								<Box
									display={'flex'}
									align={'center'}
									onClick={() => {
										setSearchShown((s) => !s)
									}}
								>
									<IconSearch
										color={colors.neutral300}
										height={16}
										width={16}
									/>
								</Box>
								<Form.Input
									id="search"
									name={'Search'}
									placeholder={'Search'}
									size={'xSmall'}
									collapsed={!searchShown}
									onChange={(e) =>
										props.setFilter(e.target.value)
									}
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

					<MenuButton
						size={'medium'}
						options={Object.values(LogLevel)}
						onChange={(ll: string) =>
							props.setLogLevel(ll as LogLevel)
						}
					/>
					<SwitchButton
						style={{ padding: '0 4px' }}
						size={'xSmall'}
						iconRight={
							<IconSwitchHorizontal
								width={12}
								height={12}
								className={styles.switchInverted}
							/>
						}
						checked={props.autoScroll}
						onChange={() => {
							props.setAutoScroll(!props.autoScroll)
						}}
					>
						Auto scroll
					</SwitchButton>
				</Box>
			</Box>
		</Box>
	)
}

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
	const [logLevel, setLogLevel] = React.useState<LogLevel>(LogLevel.All)
	const [autoScroll, setAutoScroll] = useLocalStorage<boolean>(
		'highlight-devtools-v2-autoscroll',
		false,
	)
	const { height } = useWindowSize()
	const maxHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, height / 2)
	const defaultHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, maxHeight / 2)

	let page: React.ReactNode = null
	switch (tab) {
		case Tab.Errors:
			page = (
				<ErrorsPage
					autoScroll={autoScroll}
					filter={filter}
					time={time}
				/>
			)
			break
		case Tab.Console:
			page = (
				<ConsolePage
					autoScroll={autoScroll}
					logLevel={logLevel}
					filter={filter}
					time={time}
				/>
			)
			break
	}

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
				<div>
					<div className={'flex justify-center align-middle'}>
						<button
							className="flex cursor-ns-resize justify-center border-none bg-transparent p-2 outline-none"
							ref={handleRef}
						>
							<div className="relative h-2 w-10 rounded-full bg-gray-200" />
						</button>
					</div>
					<div
						className={styles.devToolsWindowV2}
						ref={panelRef}
						style={{ width: props.width }}
					>
						<DevToolsControlBar
							filter={filter}
							setFilter={setFilter}
							tab={tab}
							setTab={setTab}
							autoScroll={autoScroll}
							setAutoScroll={setAutoScroll}
							setLogLevel={setLogLevel}
						/>
						<Box className={styles.pageWrapper}>{page}</Box>
					</div>
				</div>
			)}
		</ResizePanel>
	)
}

export default DevToolsWindowV2
