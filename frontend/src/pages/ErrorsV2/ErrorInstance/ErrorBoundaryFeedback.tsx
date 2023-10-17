import { Box, IconSolidArrowCircleRight, Tag, Text } from '@highlight-run/ui'
import { buildQueryURLString } from '@util/url/params'
import moment from 'moment'

import { useAuthContext } from '@/authentication/AuthContext'
import { Link } from '@/components/Link'
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

	const params = buildQueryURLString({
		tsAbs: errorObject.timestamp,
		[PlayerSearchParameters.errorId]: errorObject.id,
	})
	return `/${errorObject.project_id}/sessions/${errorObject.session?.secure_id}?${params}`
}

const SessionComment = ({
	sessionComment,
	isLoggedIn,
	errorObject,
	index,
}: SessionCommentProps) => {
	const sessionLink = getSessionLink(errorObject)

	const tag = (
		<Link to={sessionLink}>
			<Tag
				kind="secondary"
				emphasis="low"
				size="medium"
				shape="basic"
				disabled={!isLoggedIn || sessionLink === ''}
				iconRight={<IconSolidArrowCircleRight />}
			>
				Go to
			</Tag>
		</Link>
	)
	const timeAgo = moment(sessionComment.created_at).fromNow()
	return (
		<Box
			bt={index !== 0 ? 'secondary' : undefined}
			pb="8"
			display="flex"
			justifyContent="center"
			flexDirection="column"
		>
			<Box
				py="4"
				alignItems="center"
				display="flex"
				justifyContent="space-between"
				gap="4"
			>
				<Box alignItems="flex-start" display="flex" gap="8">
					<Text lines="1" color="weak" size="small">
						Feedback #{index + 1}
					</Text>
					<Text
						size="small"
						color="secondaryContentOnDisabled"
						lines="1"
					>
						{timeAgo}
					</Text>
				</Box>

				<Box flexShrink={0} display="flex">
					{tag}
				</Box>
			</Box>
			<Text lines="1" align="left" size="xSmall">
				{sessionComment.text}
			</Text>
		</Box>
	)
}

export const ErrorBoundaryFeedback = ({ data: errorObject }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { session } = errorObject

	if (session) {
		const { session_comments = [] } = session
		if (!session_comments?.length) {
			return null
		}
		const comments = session_comments.map(
			(sessionComment, index) =>
				sessionComment && (
					<SessionComment
						key={sessionComment.id}
						isLoggedIn={isLoggedIn}
						sessionComment={sessionComment}
						errorObject={errorObject}
						index={index}
					/>
				),
		)
		return (
			<Box px="12" bb="secondary" bt="secondary">
				{comments}
			</Box>
		)
	}
	return null
}
