import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import {
	useCreateErrorCommentMutation,
	useCreateIssueForErrorCommentMutation,
	useCreateIssueForSessionCommentMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidClickUp,
	IconSolidLinear,
	IconSolidX,
	Stack,
	Text,
	useFormStore,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
import {
	CLICKUP_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import { H } from 'highlight.run'
import React, { useMemo, useState } from 'react'

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

	React.useEffect(() => {
		if (!defaultIssueTitle && !commentText) return

		form.setValues((prev) => ({
			...prev,
			issueTitle: defaultIssueTitle,
			issueDescription: commentText,
		}))

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultIssueTitle, commentText])

	const [containerId, setContainerId] = useState('')

	const { project_id } = useParams<{
		project_id: string
	}>()

	const { admin } = useAuthContext()

	const [loading, setLoading] = useState(false)

	const [createIssueForErrorComment] = useCreateIssueForErrorCommentMutation({
		refetchQueries: [namedOperations.Query.GetErrorIssues],
	})

	const [createIssueForSessionComment] =
		useCreateIssueForSessionCommentMutation()

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
				await createIssueForSessionComment({
					variables: {
						project_id: project_id!,
						session_url: currentUrl,
						session_comment_id: commentId,
						text_for_attachment: text,
						issue_title: issueTitle,
						issue_team_id: issueTeamId,
						issue_description: issueDescription,
						integrations,
						author_name: author,
						time: timestamp || 0,
					},
				})
			} else if (commentType === 'ErrorComment') {
				if (commentId) {
					await createIssueForErrorComment({
						variables: {
							project_id: project_id!,
							error_url: currentUrl,
							error_comment_id: commentId,
							text_for_attachment: text,
							issue_title: issueTitle,
							issue_team_id: issueTeamId,
							issue_description: issueDescription,
							integrations,
							author_name: author,
						},
					})
				} else if (errorSecureId) {
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
							issue_description: issueDescription,
						},
						refetchQueries: [namedOperations.Query.GetErrorIssues],
						awaitRefetchQueries: true,
					})
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
				<Form aria-labelledBy="newComment" store={form}>
					<Box
						px="12"
						py="8"
						gap="12"
						display="flex"
						flexDirection="column"
					>
						{selectedIntegration.containerSelection({
							setSelectionId: setContainerId,
							disabled: loading,
						})}
						<Form.Input
							name={form.names.issueTitle}
							label="Issue Title"
							placeholder="Add a concise summary of the issue"
							outline
							truncate
							required
							disabled={loading}
						/>
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
