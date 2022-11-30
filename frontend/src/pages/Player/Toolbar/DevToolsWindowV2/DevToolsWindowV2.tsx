import { ErrorObject } from '@graph/schemas'
import {
	Box,
	Button,
	DropdownButton,
	IconSearch,
	IconSwitchHorizontal,
	Stack,
	SwitchButton,
	Tag,
} from '@highlight-run/ui/src'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { getErrorBody } from '@util/errors/errorUtils'
import { parseOptionalJSON } from '@util/string'
import React, { useMemo } from 'react'

import * as styles from './style.css'

enum Tab {
	Errors = 'Errors',
	Console = 'Console',
	Network = 'Network',
	Performance = 'Performance',
}

const DevToolsControlBar: React.FC<
	React.PropsWithChildren & {
		tab: Tab
		setTab: React.Dispatch<React.SetStateAction<Tab>>
		autoScroll: boolean
		setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>
	}
> = (props) => {
	return (
		<Box
			px={'8'}
			py={'6'}
			display={'flex'}
			width={'full'}
			justifyContent={'space-between'}
			align={'center'}
		>
			<Box gap={'6'} display={'flex'}>
				{[Tab.Errors, Tab.Console, Tab.Network, Tab.Performance].map(
					(t) => (
						<Button
							key={t}
							size={'xSmall'}
							kind={t === props.tab ? 'primary' : 'secondary'}
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
				display={'inline-flex'}
				justifyContent={'space-between'}
				gap={'6'}
				align={'center'}
			>
				<Box
					display={'inline-flex'}
					justifyContent={'space-between'}
					gap={'4'}
					align={'center'}
				>
					<IconSearch color={colors.neutral300} />
					<DropdownButton
						size={'xSmall'}
						options={['All', 'Info', 'Log', 'Warn', 'Error']}
						onChange={() => {}}
					/>
					<SwitchButton
						style={{ padding: '0 4px' }}
						width={'full'}
						iconRight={
							<IconSwitchHorizontal
								width={12}
								height={12}
								className={styles.switchInverted}
							/>
						}
						checked={props.autoScroll}
						onChange={() => {
							props.setAutoScroll((a) => !a)
						}}
					>
						Auto scroll
					</SwitchButton>
				</Box>
			</Box>
		</Box>
	)
}

const ErrorRow: React.FC<
	React.PropsWithChildren & {
		error: ErrorObject
	}
> = ({ error }) => {
	const body = useMemo(
		() => parseOptionalJSON(getErrorBody(error.event)),
		[error.event],
	)
	const context = useMemo(() => {
		const data = parseOptionalJSON(error.payload || '')
		return data === 'null' ? '' : data
	}, [error.payload])
	return (
		<Box className={styles.errorRow}>
			<span>{body}</span>
			<span>{context}</span>
			<Tag kind={'grey'}>{error.type}</Tag>
		</Box>
	)
}

const ErrorsPage: React.FC<
	React.PropsWithChildren<{ autoScroll: boolean }>
> = () => {
	// TODO(vkorolik) implement scrolling
	const { errors } = useReplayerContext()
	return (
		<Box className={styles.errorsBox}>
			<Stack gap={'0'}>
				{errors.map((e) => (
					<ErrorRow key={e.error_group_secure_id} error={e} />
				))}
			</Stack>
		</Box>
	)
}

const DevToolsWindowV2: React.FC<
	React.PropsWithChildren & {
		width: number
	}
> = (props) => {
	const [tab, setTab] = React.useState<Tab>(Tab.Errors)
	const [autoScroll, setAutoScroll] = React.useState<boolean>(false)
	let page: React.ReactNode = null
	switch (tab) {
		case Tab.Errors:
			page = <ErrorsPage autoScroll={autoScroll} />
	}
	return (
		<div className={styles.devToolsWindowV2} style={{ width: props.width }}>
			<DevToolsControlBar
				tab={tab}
				setTab={setTab}
				autoScroll={autoScroll}
				setAutoScroll={setAutoScroll}
			/>
			{page}
		</div>
	)
}

export default DevToolsWindowV2
