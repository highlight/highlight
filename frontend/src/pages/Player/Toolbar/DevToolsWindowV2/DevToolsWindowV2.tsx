import { ErrorObject } from '@graph/schemas'
import {
	Box,
	Button,
	IconCaretDown,
	IconDotsHorizontal,
	IconPlusSm,
	Stack,
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
		setTab: React.Dispatch<React.SetStateAction<Tab>>
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
			<Button
				iconRight={<IconCaretDown />}
				kind={'secondary'}
				options={[Tab.Errors]}
				onSelectOption={(value: string) => {
					// TODO(vkorolik)
					// props.setTab(value)
				}}
			>
				Errors
			</Button>
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
					<IconPlusSm color={colors.neutral300} />
					<span>Add filter</span>
				</Box>
				<IconDotsHorizontal color={colors.neutral300} />
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

const ErrorsPage: React.FC = () => {
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
	let page: React.ReactNode = null
	switch (tab) {
		case Tab.Errors:
			page = <ErrorsPage />
	}
	return (
		<div className={styles.devToolsWindowV2} style={{ width: props.width }}>
			<DevToolsControlBar setTab={setTab} />
			{page}
		</div>
	)
}

export default DevToolsWindowV2
