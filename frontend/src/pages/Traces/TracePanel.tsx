import { Dialog } from '@highlight-run/ui'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TracePage } from '@/pages/Traces/TracePage'
import { TraceProvider } from '@/pages/Traces/TraceProvider'
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

	return (
		<Dialog
			store={traceDialogStore}
			modal={false}
			autoFocusOnShow={false}
			className={styles.dialog}
		>
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
