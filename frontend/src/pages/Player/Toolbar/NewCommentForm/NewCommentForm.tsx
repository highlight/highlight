import { useAuthContext } from '@authentication/AuthContext'
import {
	AdminSuggestion,
	filterMentionedAdmins,
	filterMentionedSlackUsers,
	parseAdminSuggestions,
} from '@components/Comment/utils/utils'
import {
	useCreateErrorCommentMutation,
	useCreateSessionCommentMutation,
	useGetCommentMentionSuggestionsQuery,
	useGetWorkspaceAdminsByProjectIdQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Admin,
	IntegrationType,
	SanitizedAdminInput,
	SanitizedSlackChannelInput,
	Session,
} from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidClickUp,
	IconSolidGithub,
	IconSolidHeight,
	IconSolidLinear,
	IconSolidPaperAirplane,
	IconSolidPlus,
	IconSolidViewGridAdd,
	IconSolidX,
	Menu,
	Stack,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { useIsProjectIntegratedWith } from '@pages/IntegrationsPage/components/common/useIsProjectIntegratedWith'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import ISSUE_TRACKER_INTEGRATIONS, {
	IssueTrackerIntegration,
} from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { CommentTextBody } from '@pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import analytics from '@util/analytics'
import { getCommentMentionSuggestions } from '@util/comment/util'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { OnChangeHandlerFunc } from 'react-mentions'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import { CommentMentionButton } from '@/components/Comment/CommentMentionButton'

import { Coordinates2D } from '../../PlayerCommentCanvas/PlayerCommentCanvas'
import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration'

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
	})
	const [createErrorComment] = useCreateErrorCommentMutation()
	const { admin, isLoggedIn } = useAuthContext()
	const { project_id } = useParams<{ project_id: string }>()
	const [commentText, setCommentText] = useState('')
	const inputRef = React.useRef<HTMLTextAreaElement>(null)
	const navigate = useNavigate()
	/**
	 * commentTextForEmail is the comment text without the formatting.
	 * For example, the display string of "hello foobar how are you?" is persisted as "hello @[foobar](foobar@example.com) how are you?"
	 */
	const [commentTextForEmail, setCommentTextForEmail] = useState('')
	const [isCreatingComment, setIsCreatingComment] = useState(false)
	const [section, setSection] = useState<CommentFormSection>(
		CommentFormSection.CommentForm,
	)
	const [selectedIssueService, setSelectedIssueService] =
		useState<IntegrationType>()
	const [containerId, setContainerId] = useState('')
	const formState = useFormState({
		defaultValues: {
			commentText: '',
			issueTitle: '',
			issueDescription: '',
		},
	})

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
		variables: { project_id: project_id! },
		skip: !project_id,
	})
	const { data: mentionSuggestionsData } =
		useGetCommentMentionSuggestionsQuery({
			variables: { project_id: project_id! },
			skip: !project_id,
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

		const { issueTitle, issueDescription } = formState.values

		try {
			await createErrorComment({
				variables: {
					project_id: project_id!,
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
			formState.reset()
			setCommentText('')
			onCloseHandler()
		} catch (_e) {
			const e = _e as Error
			analytics.track('Create Error Comment Failed', {
				error: e.toString(),
			})
			message.error('Failed to post a comment, please try again.')
		}
		setIsCreatingComment(false)
	}

	const onCreateSessionComment = async () => {
		analytics.track('Create Comment', {
			numHighlightAdminMentions: mentionedAdmins.length,
			numSlackMentions: mentionedSlackUsers.length,
		})
		setIsCreatingComment(true)

		const { issueTitle, issueDescription } = formState.values

		try {
			await createComment({
				variables: {
					project_id: project_id!,
					session_secure_id: session_secure_id || '',
					session_timestamp: Math.floor(commentTime),
					text: commentText.trim(),
					text_for_email: commentTextForEmail.trim(),
					x_coordinate: commentPosition?.x || 0,
					y_coordinate: commentPosition?.y || 0,
					session_url: `${window.location.origin}${window.location.pathname}`,
					tagged_admins: mentionedAdmins,
					tagged_slack_users: mentionedSlackUsers,
					tags: [],
					time: commentTime / 1000,
					author_name: admin?.name || admin?.email || 'Someone',
					issue_team_id: containerId || undefined,
					integrations: selectedIssueService
						? [selectedIssueService]
						: [],
					issue_title: selectedIssueService ? issueTitle : null,
					issue_description: selectedIssueService
						? issueDescription
						: null,
					additional_context: currentUrl
						? `*User\'s URL:* <${currentUrl}|${currentUrl}>`
						: null,
				},
				refetchQueries: [namedOperations.Query.GetSessionComments],
			})
			onCloseHandler()
			formState.reset()
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
				'Failed to post a comment, please try again. If this keeps failing please reach out to us!',
			)
		}
		setIsCreatingComment(false)
	}

	const handleSubmit = () => {
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

		if (adminsInWorkspace?.admins) {
			setMentionedAdmins(
				filterMentionedAdmins(
					adminsInWorkspace.admins.map((wa) => wa.admin),
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
		setCommentText(e.target.value)
	}

	const onFormChangeHandler: React.KeyboardEventHandler<HTMLFormElement> = (
		e,
	) => {
		if (e.key === 'Enter' && e.metaKey) {
			handleSubmit()
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

	const { settings: githubSettings } = useGitHubIntegration()

	const issueIntegrationsOptions = useMemo(() => {
		const integrations = []
		if (isLinearIntegratedWithProject) {
			integrations.push({
				displayValue: (
					<Stack direction="row" gap="4" align="center">
						<IconSolidLinear />
						Create a Linear issue
					</Stack>
				),
				id: 'linear',
				value: IntegrationType.Linear,
			})
		}
		if (isClickupIntegrated) {
			integrations.push({
				displayValue: (
					<Stack direction="row" gap="4" align="center">
						<IconSolidClickUp />
						Create a ClickUp task
					</Stack>
				),
				id: 'clickup',
				value: IntegrationType.ClickUp,
			})
		}
		if (isHeightIntegrated) {
			integrations.push({
				displayValue: (
					<Stack direction="row" gap="4" align="center">
						<IconSolidHeight />
						Create a Height task
					</Stack>
				),
				id: 'height',
				value: IntegrationType.Height,
			})
		}
		if (githubSettings.isIntegrated) {
			integrations.push({
				displayValue: (
					<Stack direction="row" gap="4" align="center">
						<IconSolidGithub />
						Create a GitHub issue
					</Stack>
				),
				id: 'github',
				value: IntegrationType.GitHub,
			})
		}
		return integrations
	}, [
		isLinearIntegratedWithProject,
		isClickupIntegrated,
		isHeightIntegrated,
		githubSettings.isIntegrated,
	])

	useEffect(() => {
		const idx = modalHeader?.toLowerCase().indexOf('issue') || -1
		if (idx !== -1 && issueIntegrationsOptions.length !== 0) {
			setSelectedIssueService(issueIntegrationsOptions[0].value)
		}
	}, [modalHeader, issueIntegrationsOptions])

	useEffect(() => {
		if (inputRef.current) {
			// Focuses the comment box when the modal is opened
			inputRef.current.focus()
		}
	}, [])

	const integrationName = issueServiceDetail?.name ?? ''
	const issueLabel = issueServiceDetail?.issueLabel ?? ''

	return (
		<Box>
			<Form
				name="newComment"
				onSubmit={handleSubmit}
				state={formState}
				onKeyDown={onFormChangeHandler}
			>
				{section === CommentFormSection.NewIssueForm && (
					<Box backgroundColor="white" borderRadius="8">
						<Box pl="12" pr="6" py="4" borderBottom="divider">
							<Stack
								direction="row"
								align="center"
								justify="space-between"
							>
								<Stack direction="row" align="center">
									<img
										src={issueServiceDetail?.icon}
										height={14}
										width={14}
									/>
									<Text size="xxSmall" weight="medium">
										Create a new {integrationName}{' '}
										{issueLabel}
									</Text>
								</Stack>
								<ButtonIcon
									onClick={() => {
										setSection(
											CommentFormSection.CommentForm,
										)
									}}
									size="xSmall"
									kind="secondary"
									emphasis="low"
									icon={<IconSolidX size={14} />}
								/>
							</Stack>
						</Box>
						<Stack direction="column" gap="12" p="12">
							{issueServiceDetail?.containerSelection({
								setSelectionId: setContainerId,
							})}
							<Form.Input
								name="issueTitle"
								label="Title"
								placeholder="Title"
							/>
							<Form.Input
								name="issueDescription"
								label="Description"
								// @ts-expect-error
								as="textarea"
							/>
						</Stack>
						<Stack
							align="center"
							direction="row"
							justify="flex-end"
							backgroundColor="raised"
							borderBottomLeftRadius="8"
							borderBottomRightRadius="8"
							borderTop="divider"
							p="6"
							gap="4"
						>
							<Button
								kind="secondary"
								emphasis="high"
								size="small"
								trackingId="new-comment-attach-issue_cancel"
								onClick={() => {
									formState.setValues({
										...formState.values,
										issueTitle: '',
										issueDescription: '',
									})
									setSelectedIssueService(undefined)
									setSection(CommentFormSection.CommentForm)
								}}
							>
								Cancel
							</Button>
							<Button
								kind="primary"
								emphasis="high"
								size="small"
								trackingId="new-comment-attach-issue_submit"
								onClick={() => {
									setSection(CommentFormSection.CommentForm)
								}}
							>
								Save
							</Button>
						</Stack>
					</Box>
				)}

				{section === CommentFormSection.CommentForm && (
					<Box p="6">
						<Box>
							<CommentTextBody
								newInput
								inputRef={inputRef}
								commentText={commentText}
								onChangeHandler={onChangeHandler}
								placeholder={placeholder}
								suggestions={adminSuggestions}
								onDisplayTransformHandler={onDisplayTransform}
								suggestionsPortalHost={
									parentRef?.current as Element
								}
							/>
						</Box>
						<Stack
							my="2"
							direction="row"
							justify="space-between"
							align="center"
						>
							<Stack direction="row" gap="4" align="center">
								<Menu>
									<Menu.Button
										kind="secondary"
										emphasis="high"
										size="xSmall"
										icon={<IconSolidPlus />}
									/>
									<Menu.List>
										{issueIntegrationsOptions.map(
											({ displayValue, id, value }) => (
												<Menu.Item
													key={id}
													onClick={() => {
														formState.setValue(
															'issueTitle',
															defaultIssueTitle,
														)

														if (
															!formState.getValue(
																'issueDescription',
															)
														) {
															formState.setValue(
																'issueDescription',
																commentTextForEmail,
															)
														}

														setSelectedIssueService(
															value,
														)
														setSection(
															CommentFormSection.NewIssueForm,
														)
													}}
												>
													{displayValue}
												</Menu.Item>
											),
										)}
										<Menu.Divider />
										<Menu.Item
											onClick={() => {
												navigate(
													`/${project_id}/integrations`,
												)
											}}
										>
											<Stack
												direction="row"
												gap="4"
												align="center"
											>
												<IconSolidViewGridAdd />
												Add new integration
											</Stack>
										</Menu.Item>
									</Menu.List>
								</Menu>

								<CommentMentionButton
									commentText={commentText}
									inputRef={inputRef}
									setCommentText={setCommentText}
								/>
							</Stack>
							{/* TODO: Add mention button */}
							<Stack direction="row" align="center" gap="4">
								{issueServiceDetail && (
									<Button
										trackingId="new-comment-form_edit-issue"
										size="xSmall"
										kind="secondary"
										emphasis="low"
										iconLeft={<issueServiceDetail.Icon />}
										onClick={() => {
											setSection(
												CommentFormSection.NewIssueForm,
											)
										}}
									>
										{issueServiceDetail.name}
									</Button>
								)}
								<ButtonIcon
									kind="primary"
									emphasis="high"
									size="xSmall"
									disabled={
										isCreatingComment ||
										commentText.length === 0
									}
									onClick={handleSubmit}
									icon={<IconSolidPaperAirplane />}
								/>
							</Stack>
						</Stack>
					</Box>
				)}
			</Form>
		</Box>
	)
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
