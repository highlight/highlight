import { useAuthContext } from '@authentication/AuthContext'
import { GetErrorGroupQuery } from '@graph/operations'
import { Button, IconSolidDocumentAdd } from '@highlight-run/ui'
import {
	CreateModalType,
	ErrorCreateCommentModal,
} from '@pages/Error/components/ErrorCreateCommentModal/ErrorCreateCommentModal'
import React, { useState } from 'react'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorIssueButton = ({ errorGroup }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const [showCreateCommentModal, setShowCreateCommentModal] =
		useState<CreateModalType>(CreateModalType.None)

	return (
		<>
			<Button
				kind="secondary"
				size="small"
				emphasis="high"
				disabled={!isLoggedIn}
				onClick={() => {
					if (isLoggedIn) {
						setShowCreateCommentModal(CreateModalType.Issue)
					}
				}}
				iconLeft={<IconSolidDocumentAdd />}
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
