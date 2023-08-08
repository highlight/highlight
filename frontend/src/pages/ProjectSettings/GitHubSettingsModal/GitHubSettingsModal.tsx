import { Button } from '@components/Button'
import { LinkButton } from '@components/LinkButton'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { Box, Form, Stack, Text } from '@highlight-run/ui'
import { Select } from 'antd'
import _ from 'lodash'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

import * as styles from './GitHubSettingsModal.css'

type Props = {
	service: any
	githubRepos: any[]
	handleSave: (service: any, repo?: any) => void
	githubIntegrated: boolean
	closeModal: () => void
}

export const GitHubSettingsModal = ({
	service,
	githubRepos,
	handleSave,
	githubIntegrated,
	closeModal,
}: Props) => {
	const handleSubmit = (formValues: any) => {
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

const GithubSettingsForm = ({
	service,
	githubRepos,
	handleSubmit,
	handleCancel,
}: any) => {
	const githubOptions = useMemo(
		() =>
			githubRepos.map((repo: any) => ({
				id: repo.key,
				label: repo.name.split('/').pop(),
				value: repo.repo_id.replace(
					'https://api.github.com/repos/',
					'',
				),
			})),
		[githubRepos],
	)

	const [options, setOptions] = React.useState<any[]>(githubOptions)
	const form = Form.useFormState<{ githubRepo: string }>({
		defaultValues: { githubRepo: service?.githubRepoPath || null },
	})

	const getRepoOptions = (input: string) => {
		const filteredOptions = githubOptions.filter((option: any) => {
			const name = option.repo_id.replace(
				'https://api.github.com/repos/',
				'',
			)
			return name.toLowerCase().indexOf(input.toLowerCase()) !== -1
		})

		setOptions(filteredOptions)
	}

	const loadRepoOptions = useMemo(
		() => _.debounce(getRepoOptions, 300),
		// Ignore this so we have a consistent reference so debounce works.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[githubRepos],
	)

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
						options={options}
						notFoundContent={<span>No repos found</span>}
						optionFilterProp="label"
						filterOption
						onSearch={loadRepoOptions}
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
							Github
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
