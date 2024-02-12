import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { RadioGroup } from '@components/RadioGroup/RadioGroup'
import Select, { OptionType } from '@components/Select/Select'
import {
	useCreateErrorCommentForExistingIssueMutation,
	useCreateErrorCommentMutation,
	useCreateIssueForErrorCommentMutation,
	useCreateIssueForSessionCommentMutation,
	useLinkIssueForErrorCommentMutation,
	useLinkIssueForSessionCommentMutation,
	useSearchIssuesLazyQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidClickUp,
	IconSolidGitlab,
	IconSolidJira,
	IconSolidLinear,
	IconSolidX,
	Stack,
	Text,
	useFormStore,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import {
	CLICKUP_INTEGRATION,
	GITLAB_INTEGRATION,
	JIRA_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { H } from 'highlight.run'
import React, { useMemo, useState } from 'react'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'

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
	const form = useFormStore({
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

	const [mode, setMode] = React.useState('Create Issue')
	const [matchedIssues, setMatchedIssues] = useState<OptionType[]>([])
	const [query, setQuery] = useState<string>('')
	const [linkedIssue, setLinkedIssue] = useState({
		id: '',
		url: '',
	})
	const debouncedQuery = useDebouncedValue(query) || ''
	const [searchIssues, { data }] = useSearchIssuesLazyQuery()

	const getValueOptions = (input: string) => {
		setQuery(input)
	}

	React.useEffect(() => {
		searchIssues({
			variables: {
				project_id: project_id!,
				query: debouncedQuery,
				integration_type: selectedIntegration.name as IntegrationType,
			},
			fetchPolicy: 'cache-first',
		})
	}, [searchIssues, project_id, debouncedQuery, selectedIntegration])

	React.useEffect(() => {
		const values =
			data?.search_issues.map((s) => ({
				displayValue: s.title,
				id: s.id,
				value: s.issue_url,
			})) || []
		setMatchedIssues(values)
	}, [data?.search_issues])

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
				if (mode === 'Create Issue') {
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
					if (mode === 'Create Issue') {
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
					if (mode === 'Create Issue') {
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
			message.success('New Issue Created!')
		} catch (e: any) {
			H.consumeError(e)
			console.error(e)
			message.error('Failed to create an issue. Please try again.')
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
	return (
		<Modal
			title={
				<Box
					display="flex"
					alignItems="center"
					userSelect="none"
					px="8"
					py="4"
					bb="secondary"
					justifyContent="space-between"
				>
					<Stack direction="row" align="center" gap="4">
						{integrationLogo}
						<Text size="xxSmall" color="n11" weight="medium">
							Create a new {selectedIntegration.name} issue
						</Text>
					</Stack>
					<ButtonIcon
						kind="secondary"
						emphasis="none"
						size="xSmall"
						onClick={onClose}
						icon={
							<IconSolidX
								size={14}
								color={
									vars.theme.interactive.fill.secondary
										.content.text
								}
							/>
						}
						disabled={loading}
					/>
				</Box>
			}
			visible={visible}
			onCancel={onClose}
			minimal
			minimalPaddingSize="0"
			width="324px"
		>
			<ModalBody>
				<Box px="12" py="8" gap="12" display="flex" align="center">
					<RadioGroup
						labels={['Create Issue', 'Link Issue']}
						selectedLabel={mode}
						onSelect={(label: any) => setMode(label)}
						style={{
							width: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					/>
				</Box>
				<Form aria-labelledBy="newComment" store={form}>
					<Box
						px="12"
						py="8"
						gap="12"
						display="flex"
						flexDirection="column"
					>
						{mode === 'Create Issue' &&
							selectedIntegration.containerSelection({
								setSelectionId: setContainerId,
								setIssueTypeId: setIssueTypeId,
								disabled: loading,
							})}
						{mode === 'Link Issue' && (
							<Form.NamedSection
								label="Link an issue"
								name="issue_id"
							>
								<Select
									placeholder="Search Issue"
									options={matchedIssues}
									onChange={(
										value: any,
										option:
											| DefaultOptionType
											| DefaultOptionType[],
									) => {
										if (!Array.isArray(option)) {
											setLinkedIssue({
												id: value.toString(),
												url: option.value
													? option.value.toString()
													: '',
											})
										}
									}}
									allowClear={true}
									value={linkedIssue.id}
									notFoundContent={
										<p>No search results found</p>
									}
									showSearch={true}
									onSearch={getValueOptions}
								/>
							</Form.NamedSection>
						)}
						{mode === 'Create Issue' && (
							<Form.Input
								name={form.names.issueTitle}
								label="Issue Title"
								placeholder="Add a concise summary of the issue"
								outline
								truncate
								required
								disabled={loading}
							/>
						)}
						{mode === 'Create Issue' && (
							<Form.Input
								name={form.names.issueDescription}
								label="Issue Description"
								placeholder="Hey, check this out!"
								// @ts-expect-error
								as="textarea"
								outline
								aria-multiline
								rows={5}
								disabled={loading}
							/>
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
			</ModalBody>
		</Modal>
	)
}

export default NewIssueModal
