import { Box, Dialog } from '@highlight-run/ui'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { TracePage } from '@/pages/Traces/TracePage'
import { useParams } from '@/util/react-router/useParams'

import * as styles from './TracePanel.css'

export const TracePanel: React.FC = () => {
	const navigate = useNavigate()
	const { project_id } = useParams<{
		project_id: string
	}>()

	const traceDialogStore = Dialog.useStore({
		open: true,
		setOpen(open) {
			if (!open) {
				navigate(`/${project_id}/traces`, { replace: true })
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
			<Box p="8">
				<TracePage />
			</Box>
		</Dialog>
	)
}
