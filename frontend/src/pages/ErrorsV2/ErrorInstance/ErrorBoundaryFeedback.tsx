import {
	Box,
	IconSolidArrowCircleRight,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { ErrorObjectFragment } from '@/graph/generated/operations'
import { SessionComment } from '@/graph/generated/schemas'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

type Props = {
	data: ErrorObjectFragment
}

type SessionCommentProps = {
	sessionComment: Partial<Omit<SessionComment, 'attachments'>>
	isLoggedIn: boolean
	errorObject: ErrorObjectFragment
	index: number
}

const getSessionLink = (
	errorObject: ErrorObjectFragment | undefined,
): string => {
	if (!errorObject?.session) {
		return ''
	}

	const params = `tsAbs=${errorObject.timestamp}&${PlayerSearchParameters.errorId}=${errorObject.id}`
	return `/${errorObject.project_id}/sessions/${errorObject.session?.secure_id}?${params}`
}

const SessionFeedback = ({
	sessionComment,
	isLoggedIn,
	errorObject,
	index,
}: SessionCommentProps) => {
	const sessionLink = getSessionLink(errorObject)
	const navigate = useNavigate()
	const tag = (
		<Tag
			kind="secondary"
			emphasis="low"
			size="medium"
			shape="basic"
			disabled={!isLoggedIn || sessionLink === ''}
			iconRight={<IconSolidArrowCircleRight />}
			onClick={() => navigate(sessionLink)}
		>
			Go to
		</Tag>
	)
	const timeAgo = moment(sessionComment.created_at).fromNow()
	const feebackNumber = index + 1
	const feedbackNumberPrefix = feebackNumber < 10 ? '0' : ''
	const formattedFeedbackNumber = `#${feedbackNumberPrefix}${feebackNumber}`

	return (
		<>
			{index !== 0 && <Box borderTop="dividerWeak" mx="12" />}
			<Box
				backgroundColor="nested"
				pt="8"
				pb="12"
				px="12"
				display="flex"
				justifyContent="center"
				flexDirection="column"
				borderBottomLeftRadius="6"
				borderBottomRightRadius="6"
			>
				<Box pb="4" display="flex" justifyContent="space-between">
					<Box
						alignItems="center"
						display="flex"
						gap="6"
						flexGrow={1}
					>
						<Text lines="1" color="weak" size="small">
							Feedback {formattedFeedbackNumber}
						</Text>
						<Text
							size="small"
							color="secondaryContentOnDisabled"
							lines="1"
						>
							{timeAgo}
						</Text>
					</Box>

					{tag}
				</Box>
				<Text lines="1" align="left" size="small" color="default">
					{sessionComment.text}
				</Text>
			</Box>
		</>
	)
}

export const ErrorBoundaryFeedback = ({ data: errorObject }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { session } = errorObject

	if (session) {
		const { session_feedback = [] } = session
		if (!session_feedback?.length) {
			return null
		}
		const comments = session_feedback.map((sessionComment, index) => (
			<SessionFeedback
				key={sessionComment.id}
				isLoggedIn={isLoggedIn}
				sessionComment={sessionComment}
				errorObject={errorObject}
				index={index}
			/>
		))
		return <Box bt="secondary">{comments}</Box>
	}
	return null
}
