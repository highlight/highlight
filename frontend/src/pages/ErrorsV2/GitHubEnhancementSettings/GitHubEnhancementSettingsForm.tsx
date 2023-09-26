import {
	Box,
	ButtonIcon,
	Form,
	IconSolidQuestionMarkCircle,
	IconSolidTrash,
	Stack,
	Tooltip,
	vars,
} from '@highlight-run/ui'
import { Select } from 'antd'
import clsx from 'clsx'
import React, { useImperativeHandle, useMemo } from 'react'

import { ErrorObjectFragment } from '@/graph/generated/operations'
import { GitHubRepo, Maybe, Service } from '@/graph/generated/schemas'
import ErrorStackTrace from '@/pages/ErrorsV2/ErrorStackTrace/ErrorStackTrace'

import * as styles from './GitHubEnhancementSettingsForm.css'

type GithubSettingsFormProps = {
	errorObject: ErrorObjectFragment
	githubRepos: GitHubRepo[]
	service?: Maybe<Service>
	submitRef: any
	testRef: any
	testLoading: boolean
}

export type GithubSettingsFormValues = {
	githubRepo: string | null
	buildPrefix: string | null
	githubPrefix: string | null
}

export const GitHubEnhancementSettingsForm = ({
	githubRepos,
	errorObject,
	service,
	submitRef,
	testRef,
	testLoading,
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

	const formStore = Form.useFormStore<GithubSettingsFormValues>({
		defaultValues: {
			githubRepo: service?.githubRepoPath || null,
			buildPrefix: service?.buildPrefix || null,
			githubPrefix: service?.githubPrefix || null,
		},
	})
	const formState = formStore.useState()

	useImperativeHandle(
		testRef,
		() => {
			return {
				getFormValues: () => formState.values,
			}
		},
		[formState.values],
	)

	useImperativeHandle(
		submitRef,
		() => {
			return {
				getFormValues: () => formState.values,
			}
		},
		[formState.values],
	)

	return (
		<Form store={formStore}>
			<Stack direction="row" gap="0">
				<Stack gap="16" width="full" paddingRight="8">
					<Form.NamedSection
						label="Select GitHub repository"
						name="githubRepo"
					>
						<Box display="flex" alignItems="center" gap="8">
							<Select
								aria-label="GitHub repository"
								className={styles.repoSelect}
								placeholder="Search repos..."
								onSelect={(repo: string) =>
									formStore.setValue(
										formStore.names.githubRepo,
										repo,
									)
								}
								value={formState.values.githubRepo
									?.split('/')
									.pop()}
								options={githubOptions}
								notFoundContent={<span>No repos found</span>}
								optionFilterProp="label"
								filterOption
								showSearch
							/>
							<ButtonIcon
								kind="secondary"
								emphasis="medium"
								size="medium"
								disabled={!formState.values.githubRepo}
								onClick={() =>
									formStore.setValue(
										formStore.names.githubRepo,
										null,
									)
								}
								icon={
									<IconSolidTrash
										size={16}
										color={
											vars.theme.interactive.fill
												.secondary.content.text
										}
									/>
								}
							/>
						</Box>
					</Form.NamedSection>
				</Stack>
				<Stack
					gap="16"
					width="full"
					borderLeft="dividerWeak"
					paddingLeft="8"
				>
					<Form.Input
						name={formStore.names.buildPrefix}
						label="Build path prefix"
						placeholder="/build"
						icon={
							<Tooltip
								trigger={
									<IconSolidQuestionMarkCircle
										color={vars.theme.static.content.weak}
										size={14}
									/>
								}
								renderInLine
							>
								<Box cssClass={styles.tooltipContent}>
									The path added in the deployment process to
									host your files, and should be removed when
									trying to map your files to GitHub.
								</Box>
							</Tooltip>
						}
					/>
					<Form.Input
						name={formStore.names.githubPrefix}
						label="GitHub path prefix"
						placeholder="/src"
						icon={
							<Tooltip
								trigger={
									<IconSolidQuestionMarkCircle
										color={vars.theme.static.content.weak}
										size={14}
									/>
								}
								renderInLine
							>
								<Box cssClass={styles.tooltipContent}>
									The path removed in the deployment process
									to host your files, which can be seen in
									your GitHub repo.
								</Box>
							</Tooltip>
						}
					/>
				</Stack>
			</Stack>
			<Box pt="8" cssClass={clsx({ [styles.loading]: testLoading })}>
				<ErrorStackTrace errorObject={errorObject} />
			</Box>
		</Form>
	)
}
