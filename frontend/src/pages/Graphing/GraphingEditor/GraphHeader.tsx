import React from 'react'
import { Box, Text } from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'

import { Button } from '@components/Button'

import * as style from './GraphingEditor.css'

type Props = {
	isEdit: boolean
	loading: boolean
	onSave: () => void
}

export const GraphHeader: React.FC<Props> = ({ isEdit, loading, onSave }) => {
	const navigate = useNavigate()

	return (
		<Box
			width="full"
			cssClass={style.editGraphHeader}
			borderBottom="dividerWeak"
			display="flex"
			justifyContent="space-between"
			alignItems="center"
			paddingLeft="12"
			paddingRight="8"
			py="6"
		>
			<Text size="small" weight="medium">
				{isEdit ? 'Edit' : 'Create'} graph
			</Text>
			<Box display="flex" gap="4">
				<Button
					trackingId="graphing-editor-cancel-button"
					emphasis="low"
					kind="secondary"
					onClick={() => {
						navigate(-1)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="graphing-editor-save-button"
					disabled={loading}
					onClick={onSave}
				>
					Save
				</Button>
			</Box>
		</Box>
	)
}
