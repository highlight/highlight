import { useAuthContext } from '@authentication/AuthContext'
import { AdminAvatar } from '@components/Avatar/Avatar'
import Button from '@components/Button/Button/Button'
import {
	AdminSuggestion,
	parseAdminSuggestions,
} from '@components/Comment/CommentHeader'
import {
	filterMentionedAdmins,
	filterMentionedSlackUsers,
} from '@components/Comment/utils/utils'
import {
	useGetCommentMentionSuggestionsQuery,
	useGetWorkspaceAdminsByProjectIdQuery,
	useReplyToErrorCommentMutation,
	useReplyToSessionCommentMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { SanitizedAdminInput, SanitizedSlackChannelInput } from '@graph/schemas'
import SvgArrowRightIcon from '@icons/ArrowRightIcon'
import CommentTextBody from '@pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import analytics from '@util/analytics'
import { getCommentMentionSuggestions } from '@util/comment/util'
import { useParams } from '@util/react-router/useParams'
import { Form, message } from 'antd'
import React, { useMemo, useState } from 'react'
import { OnChangeHandlerFunc } from 'react-mentions'

import styles from './CommentReplyForm.module.scss'

interface CommentReplyFormProps {
	commentID: string
	parentRef?: React.RefObject<HTMLDivElement>
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

	const [commentText, setCommentText] = useState('')
	const [commentTextForEmail, setCommentTextForEmail] = useState('')
	const [isReplying, setIsReplying] = React.useState(false)
	const [form] = Form.useForm<{ commentText: string }>()

	const { project_id } = useParams<{ project_id: string }>()
	const { admin } = useAuthContext()
	const { data: mentionSuggestionsData } =
		useGetCommentMentionSuggestionsQuery({
			variables: { project_id },
		})
	const { data: workspaceAdminsData } = useGetWorkspaceAdminsByProjectIdQuery(
		{
			variables: { project_id },
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
			form.resetFields()
			setCommentText('')
		} catch (_e) {
			const e = _e as Error
			analytics.track('Reply to Comment Failed', { error: e.toString() })
			message.error(
				<>
					Failed to reply to the comment, please try again. If this
					keeps failing please message us on{' '}
					<span
						className={styles.intercomLink}
						onClick={() => {
							window.Intercom(
								'showNewMessage',
								`I can't reply to a comment. This is the error I'm getting: "${e}"`,
							)
						}}
					>
						Intercom
					</span>
					.
				</>,
			)
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
		<Form
			name="newComment"
			onFinish={submitReply}
			form={form}
			onKeyDown={onFormChangeHandler}
		>
			<div className={styles.commentAlignDiv}>
				<AdminAvatar
					size={30}
					adminInfo={{
						name: admin?.name,
						email: admin?.email,
						photo_url: admin?.photo_url ?? '',
					}}
				/>
				<div className={styles.commentInputDiv}>
					<Form.Item
						name="commentText"
						wrapperCol={{ span: 24 }}
						style={{ margin: 0, flexGrow: 1 }}
					>
						<div className={styles.commentInputContainer}>
							<CommentTextBody
								newInput
								commentText={commentText}
								onChangeHandler={onChangeHandler}
								placeholder="Add a reply..."
								suggestions={adminSuggestions}
								onDisplayTransformHandler={onDisplayTransform}
								suggestionsPortalHost={
									parentRef?.current as Element
								}
							/>
						</div>
					</Form.Item>
					<Form.Item
						shouldUpdate
						wrapperCol={{ span: 24 }}
						className={styles.actionButtonsContainer}
						style={{ margin: 0 }}
					>
						{/* This Form.Item by default are optimized to not rerender the children. For this child however, we want to rerender on every form change to change the disabled state of the button. See https://ant.design/components/form/#shouldUpdate */}
						{() => (
							<div className={styles.actionButtons}>
								<Button
									trackingId="CreateCommentReply"
									className={styles.createButton}
									type="primary"
									htmlType="submit"
									disabled={commentText.length === 0}
									loading={isReplying}
								>
									<SvgArrowRightIcon
										width={16}
										height={16}
										transform="rotate(-90)"
									/>
								</Button>
							</div>
						)}
					</Form.Item>
				</div>
			</div>
		</Form>
	)
}

export default CommentReplyForm
