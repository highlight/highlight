import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import { toast } from '@components/Toaster'
import {
	useCreateErrorCommentForExistingIssueMutation,
	useCreateErrorCommentMutation,
	useCreateIssueForErrorCommentMutation,
	useCreateIssueForSessionCommentMutation,
	useLinkIssueForErrorCommentMutation,
	useLinkIssueForSessionCommentMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import {
	Box,
	Form,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	IconSolidClickUp,
	IconSolidGitlab,
	IconSolidJira,
	IconSolidLinear,
	Stack,
	Tag,
	TagSwitchGroup,
	Text,
} from '@highlight-run/ui/components'
import {
	CLICKUP_INTEGRATION,
	GITLAB_INTEGRATION,
	JIRA_INTEGRATION,
	LINEAR_INTEGRATION,
	NewIntegrationIssueType,
} from '@pages/IntegrationsPage/Integrations'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { H } from 'highlight.run'
import React, { useMemo, useState } from 'react'

import { Modal } from '@/components/Modal/ModalV2'
import { SearchIssues } from '@/components/SearchIssues/SearchIssues'

import * as style from './NewIssueModal.css'

interface NewIssueModalProps {
	visible: boolean
	onClose: () => void
	commentId?: number
	commentText?: string
	defaultIssueTitle?: string
	timestamp?: number
	selectedIntegration: IssueTrackerIntegration
	commentType: 'ErrorComment' | 'SessionComment'
}
const NewIssueModal: React.FC<React.PropsWithChildren<NewIssueModalProps>> = ({
	visible,
	onClose,
	commentId,
	selectedIntegration,
	commentText,
	commentType,
	defaultIssueTitle,
	timestamp,
}) => {
	const form = Form.useStore({
		defaultValues: {
			issueTitle: defaultIssueTitle,
			issueDescription: commentText,
		},
	})

	const [containerId, setContainerId] = useState('')
	const [issueTypeId, setIssueTypeId] = useState('')

	const { project_id } = useParams<{
		project_id: string
	}>()

	const { admin } = useAuthContext()

	const [loading, setLoading] = useState(false)
	const [moreOptions, setMoreOptions] = useState(false)

	const [createIssueForErrorComment] = useCreateIssueForErrorCommentMutation({
		refetchQueries: [namedOperations.Query.GetErrorIssues],
	})

	const [createErrorCommentForExistingIssue] =
		useCreateErrorCommentForExistingIssueMutation({
			refetchQueries: [namedOperations.Query.GetErrorIssues],
		})
	const [linkIssueForErrorComment] = useLinkIssueForErrorCommentMutation({
		refetchQueries: [namedOperations.Query.GetErrorIssues],
	})

	const [createIssueForSessionComment] =
		useCreateIssueForSessionCommentMutation()

	const [linkIssueForSessionComment] = useLinkIssueForSessionCommentMutation()

	const currentUrl = `${
		window.location.port === '' ? GetBaseURL() : window.location.origin
	}${window.location.pathname}`
	const { error_secure_id: errorSecureId } = useParams<{
		error_secure_id?: string
	}>()

	const [createErrorComment] = useCreateErrorCommentMutation({
		refetchQueries: [
			namedOperations.Query.GetErrorComments,
			namedOperations.Query.GetErrorIssues,
		],
	})

	const [mode, setMode] = React.useState(NewIntegrationIssueType.CreateIssue)
	const [linkedIssue, setLinkedIssue] = useState({
		id: '',
		url: '',
		title: '',
	})

	React.useEffect(() => {
		if (!defaultIssueTitle && !commentText) return

		form.setValues((prev) => ({
			...prev,
			issueTitle: defaultIssueTitle,
			issueDescription: commentText,
		}))

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultIssueTitle, commentText])

	const onFinish = async () => {
		setLoading(true)
		try {
			const issueTitle = form.getValue(form.names.issueTitle)
			const issueDescription =
				form.getValue(form.names.issueDescription) ?? ''

			const issueTeamId = containerId || ''
			const text = commentText ?? 'Open in Highlight'
			const author = admin?.name || admin?.email || 'Someone'
			const integrations = [selectedIntegration.name] as IntegrationType[]
			if (commentType === 'SessionComment' && commentId) {
				if (mode === NewIntegrationIssueType.CreateIssue) {
					await createIssueForSessionComment({
						variables: {
							project_id: project_id!,
							session_url: currentUrl,
							session_comment_id: commentId,
							text_for_attachment: text,
							issue_title: issueTitle,
							issue_team_id: issueTeamId,
							issue_description: issueDescription,
							issue_type_id: issueTypeId || undefined,
							integrations,
							author_name: author,
							time: timestamp || 0,
						},
					})
				} else {
					linkIssueForSessionComment({
						variables: {
							project_id: project_id!,
							session_url: currentUrl,
							session_comment_id: commentId,
							author_name: author,
							text_for_attachment: text,
							time: timestamp || 0,
							issue_title: issueTitle,
							issue_id: linkedIssue.id,
							issue_url: linkedIssue.url,
							integrations,
						},
					})
				}
			} else if (commentType === 'ErrorComment') {
				if (commentId) {
					if (mode === NewIntegrationIssueType.CreateIssue) {
						await createIssueForErrorComment({
							variables: {
								project_id: project_id!,
								error_url: currentUrl,
								error_comment_id: commentId,
								text_for_attachment: text,
								issue_title: issueTitle,
								issue_team_id: issueTeamId,
								issue_type_id: issueTypeId || undefined,
								issue_description: issueDescription,
								integrations,
								author_name: author,
							},
						})
					} else {
						await linkIssueForErrorComment({
							variables: {
								project_id: project_id!,
								error_url: currentUrl,
								error_comment_id: commentId,
								text_for_attachment: text,
								issue_title: issueTitle,
								integrations,
								author_name: author,
								issue_url: linkedIssue.url,
								issue_id: linkedIssue.id,
							},
						})
					}
				} else if (errorSecureId) {
					if (mode === NewIntegrationIssueType.CreateIssue) {
						await createErrorComment({
							variables: {
								project_id: project_id!,
								error_group_secure_id: errorSecureId,
								text,
								text_for_email: issueTitle,
								error_url: currentUrl,
								tagged_admins: [],
								tagged_slack_users: [],
								author_name: author,
								integrations,
								issue_title: issueTitle,
								issue_team_id: issueTeamId,
								issue_type_id: issueTypeId || undefined,
								issue_description: issueDescription,
							},
							refetchQueries: [
								namedOperations.Query.GetErrorIssues,
							],
							awaitRefetchQueries: true,
						})
					} else {
						await createErrorCommentForExistingIssue({
							variables: {
								project_id: project_id!,
								error_group_secure_id: errorSecureId,
								text,
								text_for_email: issueTitle,
								error_url: currentUrl,
								tagged_admins: [],
								tagged_slack_users: [],
								author_name: author,
								integrations,
								issue_title: issueTitle,
								issue_url: linkedIssue.url,
								issue_id: linkedIssue.id,
							},
							refetchQueries: [
								namedOperations.Query.GetErrorIssues,
							],
							awaitRefetchQueries: true,
						})
					}
				}
			} else {
				throw new Error('Invalid Comment Type: ' + commentType)
			}
			onClose()
			form.reset()

			const toastMessage =
				mode === NewIntegrationIssueType.CreateIssue
					? 'New Issue Created!'
					: 'Issue Linked!'
			toast.success(toastMessage)
		} catch (e: any) {
			H.consumeError(e)
			console.error(e)
			toast.error('Failed to create an issue. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const integrationLogo = useMemo(() => {
		switch (selectedIntegration.key) {
			case LINEAR_INTEGRATION.key:
				return <IconSolidLinear size={14} />
			case CLICKUP_INTEGRATION.key:
				return <IconSolidClickUp size={14} />
			case JIRA_INTEGRATION.key:
				return <IconSolidJira size={14} />
			case GITLAB_INTEGRATION.key:
				return <IconSolidGitlab size={14} />
			default:
				return <></>
		}
	}, [selectedIntegration.key])

	form.useSubmit(onFinish)

	if (!visible) {
		return null
	}

	return (
		<Modal
			title={
				<Stack direction="row" align="center" gap="4">
					{integrationLogo}
					<Text size="xxSmall" color="n11" weight="medium">
						Create a new {selectedIntegration.name} issue
					</Text>
				</Stack>
			}
			onClose={onClose}
		>
			<Box cssClass={style.modalBody}>
				{/* ClickUp doesn't support searching issues, so we don't need to show this section. */}
				{selectedIntegration.name !== 'ClickUp' && (
					<Box
						px="12"
						pt="8"
						pb="4"
						gap="12"
						display="flex"
						align="center"
					>
						<TagSwitchGroup
							cssClass={style.switchGroup}
							options={['Create Issue', 'Link Issue']}
							defaultValue={
								mode === NewIntegrationIssueType.CreateIssue
									? 'Create Issue'
									: 'Link Issue'
							}
							onChange={(label: string | number) => {
								setMode(
									label === 'Create Issue'
										? NewIntegrationIssueType.CreateIssue
										: NewIntegrationIssueType.LinkIssue,
								)
							}}
						/>
					</Box>
				)}
				<Form aria-labelledBy="newComment" store={form}>
					<Box
						px="12"
						py="8"
						gap="12"
						display="flex"
						flexDirection="column"
					>
						{mode === NewIntegrationIssueType.LinkIssue && (
							<SearchIssues
								onSelect={(value: any) => {
									if (value) {
										setLinkedIssue(value)
									}
								}}
								integration={selectedIntegration}
								project_id={project_id!}
							/>
						)}
						{mode === NewIntegrationIssueType.CreateIssue && (
							<>
								{selectedIntegration.containerSelection({
									setSelectionId: setContainerId,
									setIssueTypeId: setIssueTypeId,
									disabled: loading,
								})}

								<Form.Input
									name={form.names.issueTitle}
									label="Title"
									placeholder="Add a concise summary of the issue"
									outline
									truncate
									required
									disabled={loading}
									cssClass={style.textInput}
								/>

								<Tag
									onClick={() => setMoreOptions(!moreOptions)}
									kind="primary"
									emphasis="low"
									shape="basic"
									iconRight={
										moreOptions ? (
											<IconSolidCheveronUp />
										) : (
											<IconSolidCheveronDown />
										)
									}
									className={style.moreOptionsTag}
								>
									Additional options
								</Tag>

								{moreOptions && (
									<Form.Input
										name={form.names.issueDescription}
										label="Description"
										placeholder="Hey, check this out!"
										// @ts-expect-error
										as="textarea"
										outline
										aria-multiline
										rows={5}
										disabled={loading}
									/>
								)}
							</>
						)}
					</Box>
					<Box
						px="6"
						py="4"
						display="flex"
						alignItems="center"
						gap="6"
						justifyContent="flex-end"
						bt="secondary"
						background="n2"
					>
						<Button
							trackingId="CreateIssueCancel"
							type="reset"
							onClick={onClose}
							kind="secondary"
							size="small"
							emphasis="high"
							disabled={loading}
						>
							Cancel
						</Button>
						<Button
							trackingId="createIssueSubmit"
							type="submit"
							kind={loading ? 'secondary' : 'primary'}
							size="small"
							emphasis="high"
							loading={loading}
						>
							Submit
						</Button>
					</Box>
				</Form>
			</Box>
		</Modal>
	)
}

export default NewIssueModal
