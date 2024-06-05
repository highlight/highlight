import Button from '@components/Button/Button/Button'
import Input from '@components/Input/Input'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { toast } from '@components/Toaster'
import { useDeleteSessionsMutation } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import moment from 'moment'
import { useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'

interface Props {
	query: string
	startDate: Date
	endDate: Date
	sessionCount: number
	visible: boolean
	setVisible: (newVal: boolean) => void
}

const DELETE_SESSIONS_TEXT = 'delete sessions'

const DeleteSessionsModal = ({
	query,
	startDate,
	endDate,
	sessionCount,
	visible,
	setVisible,
}: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const [confirmationText, setConfirmationText] = useState('')

	const [deleteSessions] = useDeleteSessionsMutation()

	const onFinish = async () => {
		try {
			await deleteSessions({
				variables: {
					project_id: project_id!,
					params: {
						query,
						date_range: {
							start_date: moment(startDate).format(TIME_FORMAT),
							end_date: moment(endDate).format(TIME_FORMAT),
						},
					},
					sessionCount,
				},
			})
			setVisible(false)
			toast.success('Session deletion request sent.')
		} catch (e: any) {
			H.consumeError(e)
			console.error(e)
			toast.error(
				'Failed to create a session deletion request. Please try again.',
			)
		}
	}

	return (
		<Modal
			title={<>Delete Sessions</>}
			visible={visible}
			onCancel={() => setVisible(false)}
		>
			<ModalBody>
				<form>
					<p>
						This will permanently delete all {sessionCount} sessions
						matching your query. You will receive an email when this
						is completed.
					</p>
					<p>Please type '{DELETE_SESSIONS_TEXT}' to confirm.</p>
					<div className="mt-6 flex gap-3">
						<Input
							placeholder={DELETE_SESSIONS_TEXT}
							name="text"
							value={confirmationText}
							onChange={(e) => {
								setConfirmationText(e.target.value)
							}}
						/>
						<Button
							trackingId="ConfirmDeleteSessions"
							danger
							type="primary"
							disabled={confirmationText !== DELETE_SESSIONS_TEXT}
							onClick={onFinish}
						>
							Delete {sessionCount} Sessions
						</Button>
					</div>
				</form>
			</ModalBody>
		</Modal>
	)
}

export default DeleteSessionsModal
