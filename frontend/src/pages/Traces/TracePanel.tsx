import {
	Box,
	ButtonIcon,
	Dialog,
	IconSolidX,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'

import { PreviousNextGroup } from '@/components/PreviousNextGroup/PreviousNextGroup'
import { Trace } from '@/graph/generated/schemas'
import { TracePage } from '@/pages/Traces/TracePage'
import { TraceProvider } from '@/pages/Traces/TraceProvider'
import { TracesOutletContext } from '@/pages/Traces/TracesPage'
import analytics from '@/util/analytics'
import { useParams } from '@/util/react-router/useParams'

import * as styles from './TracePanel.css'

export const TracePanel: React.FC = () => {
	const {
		project_id: projectId,
		trace_id: traceId,
		span_id: spanId,
	} = useParams<{
		project_id: string
		trace_id: string
		span_id?: string
	}>()
	const navigate = useNavigate()
	const location = useLocation()
	const traces = useOutletContext<TracesOutletContext>()
	const currentTraceIndex = traces.findIndex(
		(trace) => trace.spanID === spanId,
	)
	const nextTrace = traces[currentTraceIndex + 1]
	const previousTrace = traces[currentTraceIndex - 1]

	const traceDialogStore = Dialog.useStore({
		open: true,
		setOpen(open: boolean) {
			if (!open) {
				navigate(`/${projectId}/traces${location.search}`, {
					replace: true,
				})
			}
		},
	})

	const goToTrace = (trace: Partial<Trace>) => {
		navigate(
			`/${projectId}/traces/${trace.traceID}/${trace.spanID}${location.search}`,
		)
	}

	useHotkeys('esc', () => {
		traceDialogStore.hide()
	})

	useHotkeys(
		'j',
		() => {
			if (nextTrace) {
				analytics.track('traces_next-trace_shortcut')
				goToTrace(nextTrace)
			}
		},
		[nextTrace],
	)

	useHotkeys(
		'k',
		() => {
			if (previousTrace) {
				analytics.track('traces_previous-trace_shortcut')
				goToTrace(previousTrace)
			}
		},
		[previousTrace],
	)

	return (
		<Dialog
			store={traceDialogStore}
			modal={false}
			autoFocusOnShow={false}
			className={styles.dialog}
		>
			<Box borderBottom="dividerWeak" py="6" pl="12" pr="8">
				<Stack direction="row" justify="space-between" align="center">
					<Stack direction="row" gap="6" align="center">
						<PreviousNextGroup
							canMoveForward={!!nextTrace}
							canMoveBackward={!!previousTrace}
							nextShortcut="j"
							prevShortcut="k"
							onNext={() => {
								if (nextTrace) {
									goToTrace(nextTrace)
								}
							}}
							onPrev={() => {
								if (previousTrace) {
									goToTrace(previousTrace)
								}
							}}
						/>

						{traces.length > 0 && (
							<Text size="xSmall" color="weak">
								{currentTraceIndex + 1}/{traces.length}
							</Text>
						)}
					</Stack>

					<ButtonIcon
						icon={<IconSolidX />}
						kind="secondary"
						emphasis="low"
						size="small"
						onClick={traceDialogStore.hide}
					/>
				</Stack>
			</Box>
			<TraceProvider
				projectId={projectId!}
				traceId={traceId!}
				spanId={spanId}
			>
				<TracePage />
			</TraceProvider>
		</Dialog>
	)
}
