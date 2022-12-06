import { useAuthContext } from '@authentication/AuthContext'
import CopyText from '@components/CopyText/CopyText'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import Switch from '@components/Switch/Switch'
import { useUpdateErrorGroupIsPublicMutation } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import { Box, Button, Heading, IconShare } from '@highlight-run/ui'
import React, { useState } from 'react'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorShareButton = ({ errorGroup }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const [showModal, setShowModal] = useState(false)

	return (
		<>
			<Button
				size="small"
				kind="secondary"
				emphasis="low"
				onClick={() => setShowModal(true)}
				iconRight={<IconShare />}
			>
				Share
			</Button>

			<Modal
				visible={showModal}
				onCancel={() => setShowModal(false)}
				destroyOnClose
				centered
				width={500}
				title="Error Sharing"
			>
				<ModalBody>
					<CopyText
						text={window.location.href}
						onCopyTooltipText="Copied error link to clipboard!"
					/>

					{isLoggedIn && (
						<Box borderTop="neutral" marginTop="24" paddingTop="20">
							<Heading level="h3">Sharing Options</Heading>

							<ExternalSharingToggle errorGroup={errorGroup} />
						</Box>
					)}
				</ModalBody>
			</Modal>
		</>
	)
}

const ExternalSharingToggle = ({ errorGroup }: Props) => {
	const [updateErrorGroupIsPublic, { loading }] =
		useUpdateErrorGroupIsPublicMutation({
			update(cache, { data }) {
				const isPublic =
					data?.updateErrorGroupIsPublic?.is_public === true

				cache.modify({
					fields: {
						errorGroup(existingErrorGroup) {
							const updatedErrorGroup = {
								...existingErrorGroup,
								isPublic,
							}
							return updatedErrorGroup
						},
					},
				})
			},
		})

	return (
		<Box my="12">
			<Switch
				loading={loading}
				checked={errorGroup?.is_public === true}
				onChange={(checked: boolean) => {
					updateErrorGroupIsPublic({
						variables: {
							error_group_secure_id: errorGroup?.secure_id || '',
							is_public: checked,
						},
					})
				}}
				label="Allow anyone with the link to view this error."
				trackingId="ErrorSharingExternal"
			/>
		</Box>
	)
}

export default ErrorShareButton
