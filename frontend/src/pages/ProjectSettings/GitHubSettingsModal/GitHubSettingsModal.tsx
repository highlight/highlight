import { Button } from '@components/Button'
import { LinkButton } from '@components/LinkButton'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { Box, Form, Stack, Text } from '@highlight-run/ui'
import { Select } from 'antd'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { GitHubRepo, Service } from '@/graph/generated/schemas'

import * as styles from './GitHubSettingsModal.css'

type Props = {
	service: Service
	githubRepos: GitHubRepo[]
	handleSave: (service: Service, repo: string | null) => void
	githubIntegrated: boolean
	closeModal: () => void
}

type FormValues = {
	githubRepo: string | null
}

export const GitHubSettingsModal = ({
	service,
	githubRepos,
	handleSave,
	githubIntegrated,
	closeModal,
}: Props) => {
	const handleSubmit = (formValues: FormValues) => {
		handleSave(service, formValues.githubRepo)
		closeModal()
	}

	if (!service) {
		return null
	}

	return (
		<Modal
			onCancel={closeModal}
			visible={!!service}
			title={`GitHub settings for ${service.name} service`}
			width="600px"
		>
			<ModalBody>
				{!githubIntegrated ? (
					<Stack>
						<Text size="small" weight="medium">
							It looks like you have not enabled GitHub to
							integrate with Highlight yet. Visit{' '}
							<Link to={`/${service.projectID}/integrations`}>
								Integrations
							</Link>{' '}
							to start creating GitHub issues from comments,
							enhancing your error stacktraces with more context,
							and more!
						</Text>
						<Box display="flex">
							<LinkButton
								to={`/${service.projectID}/integrations`}
								trackingId="github-settings-integrations-page-link"
							>
								Integrate GitHub
							</LinkButton>
						</Box>
					</Stack>
				) : (
					<GithubSettingsForm
						service={service}
						githubRepos={githubRepos}
						handleSubmit={handleSubmit}
						handleCancel={closeModal}
					/>
				)}
			</ModalBody>
		</Modal>
	)
}

type GithubSettingsFormProps = {
	service: Service
	githubRepos: GitHubRepo[]
	handleSubmit: (formValues: FormValues) => void
	handleCancel: () => void
}

const GithubSettingsForm = ({
	service,
	githubRepos,
	handleSubmit,
	handleCancel,
}: GithubSettingsFormProps) => {
	const githubOptions = useMemo(
		() =>
			githubRepos.map((repo: GitHubRepo) => ({
				id: repo.key,
				label: repo.name.split('/').pop(),
				value: repo.repo_id.replace(
					'https://api.github.com/repos/',
					'',
				),
			})),
		[githubRepos],
	)

	const form = Form.useFormState<FormValues>({
		defaultValues: { githubRepo: service.githubRepoPath || null },
	})

	return (
		<Form state={form} onSubmit={() => handleSubmit(form.values)}>
			<Stack>
				<Text size="small">
					Connect <i>{service.name}</i> to a GitHub repository to
					enable enhancements when debugging errors.
				</Text>
				<Box display="flex" alignItems="center" gap="16">
					<Select
						aria-label="GitHub Repository"
						className={styles.repoSelect}
						placeholder="Search repos..."
						onSelect={(repo: string) =>
							form.setValue(form.names.githubRepo, repo)
						}
						value={form.values.githubRepo?.split('/').pop()}
						options={githubOptions}
						notFoundContent={<span>No repos found</span>}
						optionFilterProp="label"
						filterOption
						showSearch
					/>

					<Button
						kind="danger"
						trackingId="remove-repo-from-service"
						size="medium"
						onClick={() =>
							form.setValue(form.names.githubRepo, null)
						}
						disabled={!form.values.githubRepo}
					>
						Disconnect
					</Button>
				</Box>
				{form.values.githubRepo && (
					<Text size="small">
						Want to double check? Check it out on{' '}
						<a
							href={`https://github.com/${form.values.githubRepo}/`}
							target="_blank"
							rel="noreferrer"
						>
							GitHub
						</a>
						.
					</Text>
				)}
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
					gap="16"
				>
					<Button
						kind="secondary"
						trackingId="cancel-service-github-settings"
						size="medium"
						onClick={handleCancel}
						cssClass={styles.actionButton}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						kind="primary"
						trackingId="update-service-github-settings"
						size="medium"
						cssClass={styles.actionButton}
					>
						Save
					</Button>
				</Box>
			</Stack>
		</Form>
	)
}
