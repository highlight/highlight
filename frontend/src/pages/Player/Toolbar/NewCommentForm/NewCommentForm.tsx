import { useAuthContext } from '@authentication/AuthContext'
import {
	AdminSuggestion,
	parseAdminSuggestions,
} from '@components/Comment/CommentHeader'
import Input from '@components/Input/Input'
import Select from '@components/Select/Select'
import TextArea from '@components/TextArea/TextArea'
import {
	useCreateErrorCommentMutation,
	useCreateSessionCommentMutation,
	useGetCommentMentionSuggestionsQuery,
	useGetCommentTagsForProjectQuery,
	useGetWorkspaceAdminsByProjectIdQuery,
} from '@graph/hooks'
import {
	GetCommentTagsForProjectQuery,
	namedOperations,
} from '@graph/operations'
import {
	Admin,
	IntegrationType,
	SanitizedAdminInput,
	SanitizedSlackChannelInput,
	Session,
} from '@graph/schemas'
import ArrowLeftIcon from '@icons/ArrowLeftIcon'
import ArrowRightIcon from '@icons/ArrowRightIcon'
import { useIsProjectIntegratedWith } from '@pages/IntegrationsPage/components/common/useIsProjectIntegratedWith'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import ISSUE_TRACKER_INTEGRATIONS, {
	IssueTrackerIntegration,
} from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import CommentTextBody from '@pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import SessionCommentTagSelect from '@pages/Player/Toolbar/NewCommentForm/SessionCommentTagSelect/SessionCommentTagSelect'
import analytics from '@util/analytics'
import { getCommentMentionSuggestions } from '@util/comment/util'
import { delayedRefetch } from '@util/gql'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { titleCaseString } from '@util/string'
import { Form, message } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { OnChangeHandlerFunc } from 'react-mentions'
import { Link } from 'react-router-dom'

import Button from '../../../../components/Button/Button/Button'
import { Coordinates2D } from '../../PlayerCommentCanvas/PlayerCommentCanvas'
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration'
import styles from './NewCommentForm.module.scss'

interface Props {
	commentTime: number
	onCloseHandler: () => void
	commentPosition: Coordinates2D | undefined
	parentRef?: React.RefObject<HTMLDivElement>
	session?: Session
	session_secure_id?: string
	error_secure_id?: string
	errorTitle?: string
	modalHeader?: string
	currentUrl?: string
}

enum CommentFormSection {
	CommentForm,
	NewIssueForm,
}

export const NewCommentForm = ({
	commentTime,
	onCloseHandler,
	commentPosition,
	parentRef,
	session,
	session_secure_id,
	error_secure_id,
	errorTitle,
	modalHeader,
	currentUrl,
}: Props) => {
	const [createComment] = useCreateSessionCommentMutation({
		refetchQueries: [
			namedOperations.Query.GetSessionComments,
			namedOperations.Query.GetSessionsOpenSearch,
		],
		onQueryUpdated: delayedRefetch,
	})
	const [createErrorComment] = useCreateErrorCommentMutation()
	const { admin, isLoggedIn } = useAuthContext()
	const { project_id } = useParams<{ project_id: string }>()
	const { data: commentTagsData } = useGetCommentTagsForProjectQuery({
		variables: { project_id },
		fetchPolicy: 'network-only',
	})
	const [commentText, setCommentText] = useState('')
	/**
	 * commentTextForEmail is the comment text without the formatting.
	 * For example, the display string of "hello foobar how are you?" is persisted as "hello @[foobar](foobar@example.com) how are you?"
	 */
	const [commentTextForEmail, setCommentTextForEmail] = useState('')
	const [isCreatingComment, setIsCreatingComment] = useState(false)
	const [form] = Form.useForm<{ commentText: string }>()
	const [tags, setTags] = useState([])
	const [section, setSection] = useState<CommentFormSection>(
		CommentFormSection.CommentForm,
	)
	const [selectedIssueService, setSelectedIssueService] =
		useState<IntegrationType>()
	const [containerId, setContainerId] = useState('')

	const integrationMap = useMemo(() => {
		const ret: { [key: string]: IssueTrackerIntegration } = {}
		for (const integration of ISSUE_TRACKER_INTEGRATIONS) {
			ret[integration.key] = integration
		}
		return ret
	}, [])

	const issueServiceDetail = useMemo(() => {
		if (!selectedIssueService) return undefined
		return integrationMap[selectedIssueService.toLowerCase()]
	}, [selectedIssueService, integrationMap])

	const {
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
	} = usePlayerConfiguration()
	const { data: adminsInWorkspace } = useGetWorkspaceAdminsByProjectIdQuery({
		variables: { project_id },
	})
	const { data: mentionSuggestionsData } =
		useGetCommentMentionSuggestionsQuery({
			variables: { project_id },
		})
	const [mentionedAdmins, setMentionedAdmins] = useState<
		SanitizedAdminInput[]
	>([])
	const [mentionedSlackUsers, setMentionedSlackUsers] = useState<
		SanitizedSlackChannelInput[]
	>([])

	const defaultIssueTitle = useMemo(() => {
		if (errorTitle) {
			return errorTitle
		}
		if (session?.identifier) {
			return `Issue with ${session?.identifier}'s session`
		}
		if (session?.fingerprint) {
			return `Issue with session with fingerprint #${session?.fingerprint}`
		}
		return `Issue with this Highlight session`
	}, [session, errorTitle])

	const onCreateErrorComment = async () => {
		analytics.track('Create Error Comment', {
			numHighlightAdminMentions: mentionedAdmins.length,
			numSlackMentions: mentionedSlackUsers.length,
		})
		setIsCreatingComment(true)

		const { issueTitle, issueDescription } = form.getFieldsValue([
			'issueTitle',
			'issueDescription',
		])

		try {
			await createErrorComment({
				variables: {
					project_id,
					error_group_secure_id: error_secure_id || '',
					text: commentText.trim(),
					text_for_email: commentTextForEmail.trim(),
					error_url: `${window.location.origin}${window.location.pathname}`,
					tagged_admins: mentionedAdmins,
					tagged_slack_users: mentionedSlackUsers,
					author_name: admin?.name || admin?.email || 'Someone',
					integrations: selectedIssueService
						? [selectedIssueService]
						: [],
					issue_title: selectedIssueService ? issueTitle : null,
					issue_team_id: containerId || undefined,
					issue_description: selectedIssueService
						? issueDescription
						: null,
				},
				refetchQueries: [namedOperations.Query.GetErrorComments],
			})
			form.resetFields()
			setCommentText('')
			onCloseHandler()
		} catch (_e) {
			const e = _e as Error
			analytics.track('Create Error Comment Failed', {
				error: e.toString(),
			})
			message.error(
				<>
					Failed to post a comment, please try again. If this keeps
					failing please message us on{' '}
					<span
						className={styles.intercomLink}
						onClick={() => {
							window.Intercom(
								'showNewMessage',
								`I can't create a comment. This is the error I'm getting: "${e}"`,
							)
						}}
					>
						Intercom
					</span>
					.
				</>,
			)
		}
		setIsCreatingComment(false)
	}

	const onCreateSessionComment = async () => {
		analytics.track('Create Comment', {
			numHighlightAdminMentions: mentionedAdmins.length,
			numSlackMentions: mentionedSlackUsers.length,
		})
		setIsCreatingComment(true)

		const { issueTitle, issueDescription } = form.getFieldsValue([
			'issueTitle',
			'issueDescription',
		])

		try {
			await createComment({
				variables: {
					project_id,
					session_secure_id: session_secure_id || '',
					session_timestamp: Math.floor(commentTime),
					text: commentText.trim(),
					text_for_email: commentTextForEmail.trim(),
					x_coordinate: commentPosition?.x || 0,
					y_coordinate: commentPosition?.y || 0,
					session_url: `${window.location.origin}${window.location.pathname}`,
					tagged_admins: mentionedAdmins,
					tagged_slack_users: mentionedSlackUsers,
					time: commentTime / 1000,
					author_name: admin?.name || admin?.email || 'Someone',
					tags: getTags(tags, commentTagsData),
					issue_team_id: containerId || undefined,
					integrations: selectedIssueService
						? [selectedIssueService]
						: [],
					issue_title: selectedIssueService ? issueTitle : null,
					issue_description: selectedIssueService
						? issueDescription
						: null,
					additional_context: currentUrl
						? `• From ${
								error_secure_id ? 'error' : 'session'
						  } URL: <${currentUrl}|${currentUrl}>`
						: null,
				},
				refetchQueries: [namedOperations.Query.GetSessionComments],
			})
			onCloseHandler()
			form.resetFields()
			if (!selectedTimelineAnnotationTypes.includes('Comments')) {
				setSelectedTimelineAnnotationTypes([
					...selectedTimelineAnnotationTypes,
					'Comments',
				])
			}
		} catch (_e) {
			const e = _e as Error

			analytics.track('Create Comment Failed', { error: e.toString() })
			message.error(
				<>
					Failed to post a comment, please try again.{' '}
					{!isOnPrem ? (
						<>
							If this keeps failing please message us on{' '}
							<span
								className={styles.intercomLink}
								onClick={() => {
									window.Intercom(
										'showNewMessage',
										`I can't create a comment. This is the error I'm getting: "${e}"`,
									)
								}}
							>
								Intercom
							</span>
							.
						</>
					) : (
						<>If this keeps failing please reach out to us!</>
					)}
				</>,
			)
		}
		setIsCreatingComment(false)
	}

	const onFinish = () => {
		if (session_secure_id?.length) {
			return onCreateSessionComment()
		} else if (error_secure_id?.length) {
			return onCreateErrorComment()
		} else {
			throw new Error('comment form should have session or error id set')
		}
	}

	const adminSuggestions: AdminSuggestion[] = useMemo(
		() =>
			// Guests cannot @mention a admin.
			isLoggedIn
				? parseAdminSuggestions(
						getCommentMentionSuggestions(mentionSuggestionsData),
						admin,
						mentionedAdmins,
				  )
				: [],
		[admin, isLoggedIn, mentionSuggestionsData, mentionedAdmins],
	)

	const onDisplayTransform = (_id: string, display: string): string => {
		return display
	}

	const onChangeHandler: OnChangeHandlerFunc = (
		e,
		_newValue,
		newPlainTextValue,
		mentions,
	) => {
		setCommentTextForEmail(newPlainTextValue)

		setMentionedAdmins(
			mentions
				.filter(
					(mention) =>
						!mention.display.includes('@') &&
						!mention.display.includes('#'),
				)
				.map((mention) => {
					const wa = adminsInWorkspace?.admins?.find((wa) => {
						return wa.admin?.id === mention.id
					})
					return { id: mention.id, email: wa?.admin?.email || '' }
				}),
		)

		if (mentionSuggestionsData?.slack_channel_suggestion) {
			setMentionedSlackUsers(
				mentions
					.filter(
						(mention) =>
							mention.display.includes('@') ||
							mention.display.includes('#'),
					)
					.map<SanitizedSlackChannelInput>((mention) => {
						const matchingSlackUser =
							mentionSuggestionsData.slack_channel_suggestion.find(
								(suggestion) => {
									return (
										suggestion.webhook_channel_id ===
										mention.id
									)
								},
							)

						return {
							webhook_channel_id:
								matchingSlackUser?.webhook_channel_id,
							webhook_channel_name:
								matchingSlackUser?.webhook_channel,
						}
					}),
			)
		}
		setCommentText(e.target.value)
	}

	const onFormChangeHandler: React.KeyboardEventHandler<HTMLFormElement> = (
		e,
	) => {
		if (e.key === 'Enter' && e.metaKey) {
			onFinish()
		}
	}

	const placeholder = useMemo(
		() => getNewCommentPlaceholderText(adminSuggestions, admin),
		[admin, adminSuggestions],
	)

	const { isLinearIntegratedWithProject } = useLinearIntegration()

	const { isIntegrated: isClickupIntegrated } = useIsProjectIntegratedWith(
		IntegrationType.ClickUp,
	)

	const { isIntegrated: isHeightIntegrated } = useIsProjectIntegratedWith(
		IntegrationType.Height,
	)

	const issueIntegrationsOptions = useMemo(() => {
		const integrations = []
		if (isLinearIntegratedWithProject) {
			integrations.push({
				displayValue: (
					<span>
						<img
							className={styles.integrationIcon}
							src={integrationMap['linear']?.icon}
						/>
						Create a Linear issue
					</span>
				),
				id: 'linear',
				value: IntegrationType.Linear,
			})
		}
		if (isClickupIntegrated) {
			integrations.push({
				displayValue: (
					<span>
						<img
							className={styles.integrationIcon}
							src={integrationMap['clickup']?.icon}
						/>
						Create a ClickUp task
					</span>
				),
				id: 'clickup',
				value: IntegrationType.ClickUp,
			})
		}
		if (isHeightIntegrated) {
			integrations.push({
				displayValue: (
					<span>
						<img
							className={styles.integrationIcon}
							src={integrationMap['height']?.icon}
						/>
						Create a Height task
					</span>
				),
				id: 'height',
				value: IntegrationType.Height,
			})
		}
		return integrations
	}, [
		isLinearIntegratedWithProject,
		isClickupIntegrated,
		isHeightIntegrated,
		integrationMap,
	])

	useEffect(() => {
		const idx = modalHeader?.toLowerCase().indexOf('issue') || -1
		if (idx !== -1 && issueIntegrationsOptions.length !== 0) {
			setSelectedIssueService(issueIntegrationsOptions[0].value)
		}
	}, [modalHeader, issueIntegrationsOptions])

	const integrationName = issueServiceDetail?.name ?? ''
	const issueLabel = issueServiceDetail?.issueLabel ?? ''

	return (
		<Form
			name="newComment"
			onFinish={onFinish}
			form={form}
			layout="vertical"
			onKeyDown={onFormChangeHandler}
			className={clsx(styles.form, styles.formItemSpacer)}
		>
			<div className={styles.slidesContainer}>
				<div
					className={clsx(styles.formItemSpacer, styles.slides, {
						[styles.showSecondSlide]:
							section === CommentFormSection.NewIssueForm,
					})}
				>
					<div
						className={clsx(styles.formItemSpacer, {
							[styles.hide]:
								section !== CommentFormSection.CommentForm,
						})}
					>
						<h3>{modalHeader ?? 'Add a Comment'}</h3>
						<div className={styles.commentInputContainer}>
							<CommentTextBody
								newInput
								commentText={commentText}
								onChangeHandler={onChangeHandler}
								placeholder={placeholder}
								suggestions={adminSuggestions}
								onDisplayTransformHandler={onDisplayTransform}
								suggestionsPortalHost={
									parentRef?.current as Element
								}
							/>
						</div>
						<div className={styles.formItemSpacer}>
							<Select
								aria-label="Comment tags"
								allowClear={true}
								defaultActiveFirstOption
								placeholder="Attach an issue"
								options={issueIntegrationsOptions}
								onChange={setSelectedIssueService}
								value={selectedIssueService}
								notFoundContent={
									<p>
										<Link to="../integrations">
											Add issue tracker integrations
										</Link>{' '}
										and then they should show up here
									</p>
								}
							/>

							<SessionCommentTagSelect
								onChange={setTags}
								placeholder="Add tags (e.g. signups, userflow, bug, error)"
							/>
						</div>
					</div>
					<div
						className={clsx(styles.formItemSpacer, {
							[styles.hide]:
								section !== CommentFormSection.NewIssueForm,
						})}
					>
						<h3>
							<img
								className={clsx(
									styles.integrationIcon,
									styles.largeSize,
								)}
								src={issueServiceDetail?.icon}
							/>
							Create a new {integrationName} {issueLabel}
						</h3>
						{issueServiceDetail?.containerSelection({
							setSelectionId: setContainerId,
						})}
						<Form.Item
							name="issueTitle"
							initialValue={defaultIssueTitle}
							label={`${titleCaseString(issueLabel)} Title`}
						>
							<Input
								placeholder={`${titleCaseString(
									issueLabel,
								)} Title`}
								className={styles.textBoxStyles}
							/>
						</Form.Item>
						<Form.Item
							name="issueDescription"
							label={`${titleCaseString(issueLabel)} Description`}
						>
							<TextArea
								placeholder={`${titleCaseString(
									issueLabel,
								)} Description`}
								rows={3}
								className={styles.textBoxStyles}
							/>
						</Form.Item>
					</div>
				</div>
			</div>

			<Form.Item
				shouldUpdate
				wrapperCol={{ span: 24 }}
				className={styles.actionButtonsContainer}
			>
				{/* This Form.Item by default are optimized to not rerender the children. For this child however, we want to rerender on every form change to change the disabled state of the button. See https://ant.design/components/form/#shouldUpdate */}
				{() => (
					<div className={styles.formItemSpacer}>
						<div className={styles.actionButtons}>
							<Button
								trackingId="CancelCreatingSessionComment"
								htmlType="button"
								onClick={() => {
									if (
										section ===
										CommentFormSection.NewIssueForm
									) {
										setSection(
											CommentFormSection.CommentForm,
										)
									} else {
										onCloseHandler()
										form.resetFields()
									}
								}}
							>
								{section === CommentFormSection.NewIssueForm ? (
									[
										<ArrowLeftIcon key={0} />,
										<span key={1}>Go back</span>,
									]
								) : (
									<>Cancel</>
								)}
							</Button>
							<Button
								trackingId="CreateNewSessionComment"
								type="primary"
								htmlType={
									selectedIssueService &&
									section === CommentFormSection.CommentForm
										? 'button'
										: 'submit'
								}
								className={clsx(styles.submitButton, {
									[styles.loading]: isCreatingComment,
								})}
								disabled={commentText.length === 0}
								onClick={(e) => {
									if (
										section ===
											CommentFormSection.CommentForm &&
										selectedIssueService
									) {
										e.preventDefault()
										setSection(
											CommentFormSection.NewIssueForm,
										)

										const issueDesc =
											form.getFieldValue(
												'issueDescription',
											)

										if (
											!issueDesc ||
											issueDesc.length <= 0
										) {
											form.setFields([
												{
													name: 'issueDescription',
													value: commentTextForEmail,
												},
											])
										}
									}
								}}
							>
								{selectedIssueService &&
								section === CommentFormSection.CommentForm ? (
									[
										<span key={0}>Next</span>,
										<ArrowRightIcon key={1} />,
									]
								) : (
									<span>Post</span>
								)}
							</Button>
						</div>
					</div>
				)}
			</Form.Item>
		</Form>
	)
}

const getTags = (
	tags: string[],
	tagsData: GetCommentTagsForProjectQuery | undefined,
) => {
	if (!tagsData || tags.length === 0) {
		return []
	}

	const response: { id?: string; name: string }[] = []

	tags.forEach((tag) => {
		const matchingTag = tagsData.session_comment_tags_for_project.find(
			(t) => t.name === tag,
		)

		if (matchingTag) {
			response.push({
				name: tag,
				id: matchingTag.id,
			})
		} else {
			response.push({
				name: tag,
				id: undefined,
			})
		}
	})

	return response
}

const RANDOM_COMMENT_MESSAGES = [
	'check this out!',
	'what do you think of this?',
	'should we update this?',
	'looks like the user was having trouble here.',
] as const

const getNewCommentPlaceholderText = (
	adminSuggestions?: AdminSuggestion[],
	admin?: Admin,
) => {
	const randomMessage =
		RANDOM_COMMENT_MESSAGES[
			Math.floor(Math.random() * RANDOM_COMMENT_MESSAGES.length)
		]

	if (!adminSuggestions || !admin) {
		return randomMessage
	}
	if (adminSuggestions.length === 0) {
		return `Hey @${admin.name}, ${randomMessage}`
	}

	const randomSuggestionIndex = Math.floor(
		Math.random() * adminSuggestions.length,
	)
	let displayName = adminSuggestions[randomSuggestionIndex].display || ''

	if (!(displayName[0] === '@') && !(displayName[0] === '#')) {
		displayName = `@${displayName}`
	} else if (displayName.includes('#')) {
		displayName = `@${displayName.slice(1)}`
	}

	return `Hey ${displayName}, ${randomMessage}`
}
