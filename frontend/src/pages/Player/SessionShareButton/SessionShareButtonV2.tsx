import { useAuthContext } from '@authentication/AuthContext'
import { useUpdateSessionIsPublicMutation } from '@graph/hooks'
import { Button, Text } from '@highlight-run/ui/src'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import CopyText from '../../../components/CopyText/CopyText'
import Modal from '../../../components/Modal/Modal'
import ModalBody from '../../../components/ModalBody/ModalBody'
import Switch from '../../../components/Switch/Switch'
import { useReplayerContext } from '../ReplayerContext'
import styles from './SessionShareButton.module.scss'
import { onGetLink, onGetLinkWithTimestamp } from './utils/utils'

const SessionShareButtonV2 = () => {
	const { time } = useReplayerContext()
	const { isLoggedIn } = useAuthContext()
	const [showModal, setShowModal] = useState(false)
	const [shareTimestamp, setShareTimestamp] = useState(false)

	return (
		<>
			<Button
				kind={'secondary'}
				size={'small'}
				onClick={() => {
					analytics.track('Clicked share button')
					setShowModal(true)
				}}
			>
				<Text userSelect="none">Share</Text>
			</Button>
			<Modal
				visible={showModal}
				onCancel={() => {
					setShowModal(false)
				}}
				destroyOnClose
				centered
				width={500}
				title="Session Sharing"
			>
				<ModalBody>
					<CopyText
						text={
							shareTimestamp
								? onGetLinkWithTimestamp(time).toString()
								: onGetLink().toString()
						}
						onCopyTooltipText="Copied session link to clipboard!"
					/>
					<hr className={styles.divider} />
					<h3>Sharing Options</h3>
					{isLoggedIn && <ExternalSharingToggle />}
					<Switch
						checked={shareTimestamp}
						onChange={(checked: boolean) => {
							setShareTimestamp(checked)
						}}
						label="Include current timestamp"
						trackingId="SessionShareURLIncludeTimestamp"
						setMarginForAnimation
					/>
				</ModalBody>
			</Modal>
		</>
	)
}

const ExternalSharingToggle = () => {
	const { session } = useReplayerContext()
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()
	const [updateSessionIsPublic] = useUpdateSessionIsPublicMutation({
		update(cache, { data }) {
			const is_public = data?.updateSessionIsPublic?.is_public === true
			cache.modify({
				fields: {
					session(existingSession) {
						return {
							...existingSession,
							is_public,
						}
					},
				},
			})
		},
	})
	return (
		<div className={styles.externalSharingToggle}>
			<Switch
				loading={!session}
				checked={!!session?.is_public}
				onChange={(checked: boolean) => {
					analytics.track('Toggled session isPublic', {
						is_public: checked,
					})
					updateSessionIsPublic({
						variables: {
							session_secure_id: session_secure_id,
							is_public: checked,
						},
					})
				}}
				label="Allow anyone with the link to access this session."
				trackingId="SessionSharingExternal"
				setMarginForAnimation
			/>
		</div>
	)
}

export default SessionShareButtonV2
