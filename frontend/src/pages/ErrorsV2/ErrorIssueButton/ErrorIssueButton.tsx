import { GetErrorGroupQuery } from '@graph/operations'
import { Button, IconCreateFile } from '@highlight-run/ui'
import {
	CreateModalType,
	ErrorCreateCommentModal,
} from '@pages/Error/components/ErrorCreateCommentModal/ErrorCreateCommentModal'
import React, { useState } from 'react'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorIssueButton = ({ errorGroup }: Props) => {
	const [showCreateCommentModal, setShowCreateCommentModal] =
		useState<CreateModalType>(CreateModalType.None)

	return (
		<>
			<Button
				variant="white"
				onClick={() => setShowCreateCommentModal(CreateModalType.Issue)}
				iconLeft={<IconCreateFile />}
			>
				Create Issue
			</Button>

			<ErrorCreateCommentModal
				show={showCreateCommentModal}
				onClose={() => setShowCreateCommentModal(CreateModalType.None)}
				data={{ error_group: errorGroup }}
			/>
		</>
	)
}

export default ErrorIssueButton
