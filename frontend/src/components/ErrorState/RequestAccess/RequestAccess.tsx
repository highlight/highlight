import Button from '@components/Button/Button/Button'
import { useRequestAccessMutation } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useState } from 'react'

const RequestAccess = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [requestAccess] = useRequestAccessMutation()
	const [sentAccessRequest, setSentAccessRequest] = useState(false)
	return (
		<Button
			small
			trackingId="ErrorStateRequestAccess"
			disabled={sentAccessRequest}
			type="primary"
			onClick={async () => {
				try {
					await requestAccess({
						variables: { project_id: project_id! },
					})
				} catch (_e) {
				} finally {
					message.success(
						<>
							If the workspace exists, we've sent an email to the
							owner to share access with you!
						</>,
					)
					setSentAccessRequest(true)
				}
			}}
		>
			{sentAccessRequest ? 'Access Requested!' : 'Request Access'}
		</Button>
	)
}

export default RequestAccess
