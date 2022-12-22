import { useAuthContext } from '@authentication/AuthContext'
import { GetErrorGroupQuery } from '@graph/operations'
import { Box, IconCreateFile, Popover, Text } from '@highlight-run/ui'
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
		<Popover placement="bottom-start">
			<Popover.ButtonTrigger
				kind="secondary"
				size="small"
				emphasis="high"
				disabled={!isLoggedIn}
				iconLeft={<IconCreateFile />}
			>
				Create Issue
			</Popover.ButtonTrigger>
			<Popover.Content>
				<Box
					backgroundColor="white"
					borderRadius="6"
					border="neutral"
					overflow="scroll"
					boxShadow="small"
					overflowX="hidden"
					overflowY="hidden"
					style={{ width: 224 }}
				>
					<Box p="8" bb="neutral">
						<Text size="xxSmall" weight="medium" color="neutralN11">
							Create issue
						</Text>
					</Box>
					<Box p="8" bt="neutral">
						<Box gap="4" display="flex">
							<Text
								size="small"
								weight="medium"
								color="neutralN11"
							>
								Create issue
							</Text>
						</Box>
					</Box>
				</Box>
			</Popover.Content>

			<ErrorCreateCommentModal
				show={showCreateCommentModal}
				onClose={() => setShowCreateCommentModal(CreateModalType.None)}
				data={{ error_group: errorGroup }}
			/>
		</Popover>
	)
}

export default ErrorIssueButton
