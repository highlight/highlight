import { useAuthContext } from '@authentication/AuthContext'
import {
	AdminSuggestion,
	filterMentionedAdmins,
	filterMentionedSlackUsers,
	parseAdminSuggestions,
} from '@components/Comment/utils/utils'
import { toast } from '@components/Toaster'
import {
	useGetCommentMentionSuggestionsQuery,
	useGetWorkspaceAdminsByProjectIdQuery,
	useReplyToErrorCommentMutation,
	useReplyToSessionCommentMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { SanitizedAdminInput, SanitizedSlackChannelInput } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidPaperAirplane,
	Stack,
} from '@highlight-run/ui/components'
import { CommentTextBody } from '@pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import analytics from '@util/analytics'
import { getCommentMentionSuggestions } from '@util/comment/util'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo, useState } from 'react'
import { OnChangeHandlerFunc } from 'react-mentions'

import { CommentMentionButton } from '@/components/Comment/CommentMentionButton'

interface CommentReplyFormProps {
	commentID: string
	parentRef?: React.RefObject<HTMLDivElement | null>
}

export interface CommentReplyAction {
	mutation:
		| typeof useReplyToSessionCommentMutation
		| typeof useReplyToErrorCommentMutation
	query: keyof typeof namedOperations.Query
}

export class SessionCommentReplyAction implements CommentReplyAction {
	mutation = useReplyToSessionCommentMutation
	query = namedOperations.Query.GetSessionComments
}

export class ErrorCommentReplyAction implements CommentReplyAction {
	mutation = useReplyToErrorCommentMutation
	query = namedOperations.Query.GetErrorComments
}

function CommentReplyForm<T extends CommentReplyAction>({
	action,
	commentID,
	parentRef,
}: CommentReplyFormProps & { action: T }) {
	const [reply] = action.mutation()

	const inputRef = React.useRef<HTMLTextAreaElement>(null)
	const [commentText, setCommentText] = useState('')
	const [commentTextForEmail, setCommentTextForEmail] = useState('')
	const [isReplying, setIsReplying] = React.useState(false)
	const formStore = Form.useStore({ defaultValues: { commentText: '' } })

	const { project_id } = useParams<{ project_id: string }>()
	const { admin } = useAuthContext()
	const { data: mentionSuggestionsData } =
		useGetCommentMentionSuggestionsQuery({
			variables: { project_id: project_id! },
			skip: !project_id,
		})
	const { data: workspaceAdminsData } = useGetWorkspaceAdminsByProjectIdQuery(
		{
			variables: { project_id: project_id! },
			skip: !project_id,
		},
	)
	const [mentionedAdmins, setMentionedAdmins] = useState<
		SanitizedAdminInput[]
	>([])
	const [mentionedSlackUsers, setMentionedSlackUsers] = useState<
		SanitizedSlackChannelInput[]
	>([])

	const submitReply = async () => {
		analytics.track('Reply to Comment', {
			numHighlightAdminMentions: mentionedAdmins.length,
			numSlackMentions: mentionedSlackUsers.length,
		})
		setIsReplying(true)
		try {
			await reply({
				variables: {
					comment_id: commentID,
					text: commentText.trim(),
					text_for_email: commentTextForEmail.trim(),
					sessionURL: `${window.location.origin}${window.location.pathname}`,
					errorURL: `${window.location.origin}${window.location.pathname}`,
					tagged_admins: mentionedAdmins,
					tagged_slack_users: mentionedSlackUsers,
				},
				refetchQueries: [action.query],
				awaitRefetchQueries: true,
			})
			formStore.reset()
			setCommentText('')
		} catch (_e) {
			const e = _e as Error
			analytics.track('Reply to Comment Failed', { error: e.toString() })
			toast.error('Failed to reply to the comment, please try again.')
		}
		setIsReplying(false)
	}

	const onChangeHandler: OnChangeHandlerFunc = (
		e,
		_newValue,
		newPlainTextValue,
		mentions,
	) => {
		setCommentTextForEmail(newPlainTextValue)
		setCommentText(e.target.value)

		if (workspaceAdminsData?.admins) {
			setMentionedAdmins(
				filterMentionedAdmins(
					workspaceAdminsData.admins.map((wa) => wa.admin),
					mentions,
				),
			)
		}

		if (mentionSuggestionsData?.slack_channel_suggestion) {
			setMentionedSlackUsers(
				filterMentionedSlackUsers(
					mentionSuggestionsData.slack_channel_suggestion,
					mentions,
				),
			)
		}
	}

	const onDisplayTransform = (_id: string, display: string): string => {
		return display
	}

	const onFormChangeHandler: React.KeyboardEventHandler<HTMLFormElement> = (
		e,
	) => {
		if (e.key === 'Enter' && e.metaKey) {
			submitReply()
		}
	}

	const adminSuggestions: AdminSuggestion[] = useMemo(
		() =>
			parseAdminSuggestions(
				getCommentMentionSuggestions(mentionSuggestionsData),
				admin,
				mentionedAdmins,
			),
		[admin, mentionSuggestionsData, mentionedAdmins],
	)

	if (admin === undefined) {
		return null
	}

	return (
		<Box
			backgroundColor="raised"
			borderTop="dividerWeak"
			p="6"
			borderBottomLeftRadius="8"
			borderBottomRightRadius="8"
		>
			<Form
				onSubmit={submitReply}
				store={formStore}
				onKeyDown={onFormChangeHandler}
			>
				<Box mb="4">
					<CommentTextBody
						newInput
						inputRef={inputRef}
						commentText={commentText}
						onChangeHandler={onChangeHandler}
						placeholder="Add a reply..."
						suggestions={adminSuggestions}
						onDisplayTransformHandler={onDisplayTransform}
						suggestionsPortalHost={parentRef?.current as Element}
					/>
				</Box>
				<Stack direction="row" justifyContent="space-between">
					<CommentMentionButton
						commentText={commentText}
						inputRef={inputRef}
						setCommentText={setCommentText}
					/>

					<ButtonIcon
						disabled={commentText.length === 0 || isReplying}
						onClick={submitReply}
						kind="primary"
						emphasis="high"
						icon={<IconSolidPaperAirplane />}
						size="xSmall"
					/>
				</Stack>
			</Form>
		</Box>
	)
}

export default CommentReplyForm
