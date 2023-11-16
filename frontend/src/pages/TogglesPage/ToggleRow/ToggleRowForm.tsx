import {
	useCreateFeatureToggleMutation,
	useDeleteFeatureToggleMutation,
	useEditFeatureToggleMutation,
} from '@graph/hooks'
import {
	Badge,
	Box,
	Form,
	Stack,
	Tag,
	Text,
	useFormStore,
} from '@highlight-run/ui'
import { message } from 'antd'
import moment from 'moment'
import React from 'react'

import { namedOperations } from '@/graph/generated/operations'
import { FeatureToggle } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'

import * as styles from './styles.css'

interface ToggleRowFormProps {
	isCreate?: boolean
	toggle?: FeatureToggle
	onSubmit: () => void
}

interface ToggleForm {
	name: string
	threshold: number
}

export const ToggleRowForm: React.FC<ToggleRowFormProps> = ({
	toggle,
	isCreate,
	onSubmit,
}) => {
	const { projectId } = useProjectId()
	const formStore = useFormStore<ToggleForm>({
		defaultValues: {
			name: toggle?.name || '',
			threshold: toggle?.threshold || 0,
		},
	})

	const [createFeatureToggle] = useCreateFeatureToggleMutation({
		refetchQueries: [namedOperations.Query.GetFeatureToggles],
	})

	const [editFeatureToggle] = useEditFeatureToggleMutation({
		refetchQueries: [namedOperations.Query.GetFeatureToggles],
	})

	const [deleteFeatureToggle] = useDeleteFeatureToggleMutation({
		refetchQueries: [namedOperations.Query.GetFeatureToggles],
	})

	const handleSave = () => {
		if (isCreate) {
			createFeatureToggle({
				variables: {
					project_id: projectId,
					name: formStore.getValue(formStore.names.name),
					threshold: formStore.getValue(formStore.names.threshold),
				},
			})
				.then(() => {
					message.success(`Session toggle created.`)
					onSubmit()
				})
				.catch(() => {
					message.error(`An error occurred.`)
				})
		} else if (toggle?.id) {
			editFeatureToggle({
				variables: {
					id: toggle.id,
					name: formStore.getValue(formStore.names.name),
					threshold: formStore.getValue(formStore.names.threshold),
				},
			})
				.then(() => {
					message.success(`Session toggle updated.`)
					onSubmit()
				})
				.catch(() => {
					message.error(`An error occurred.`)
				})
		} else {
			message.error(`An error occurred.`)
		}
	}

	const handleDelete = () => {
		if (toggle?.id) {
			deleteFeatureToggle({
				variables: {
					id: toggle.id,
				},
			})
				.then(() => {
					message.success(`Session toggle deleted.`)
					onSubmit()
				})
				.catch(() => {
					message.error(`An error occurred.`)
				})
		} else {
			message.error(`An error occurred.`)
		}
	}

	return (
		<Form store={formStore}>
			<Box
				border="dividerWeak"
				width="full"
				display="flex"
				p="12"
				background="raised"
				borderRadius="6"
			>
				<Box cssClass={styles.grid} width="full">
					<Stack gap="12">
						<Box display="flex" alignItems="center">
							<Form.Input
								name={formStore.names.name}
								placeholder="Toggle name..."
								label="Toggle name"
							/>
						</Box>
						{toggle && (
							<Text weight="medium" size="xSmall" color="weak">
								{toggle.created_at === toggle.updated_at ? (
									<>
										<b>Created:</b>{' '}
										{moment(toggle.created_at).fromNow()}
									</>
								) : (
									<>
										<b>Updated:</b>{' '}
										{moment(toggle.updated_at).fromNow()}
									</>
								)}
							</Text>
						)}
					</Stack>

					<Stack gap="4">
						<Form.Input
							name={formStore.names.threshold}
							type="number"
							label="Enabled percent"
							tag={
								<Badge
									shape="basic"
									variant="red"
									size="small"
									label="Red"
								/>
							}
						/>
					</Stack>
					<Stack justifySelf="flex-end" alignItems="center" gap="4">
						<Tag
							kind="primary"
							size="medium"
							shape="basic"
							emphasis="low"
							onClick={onSubmit}
						>
							Cancel
						</Tag>
						{!isCreate && (
							<Tag
								kind="primary"
								size="medium"
								shape="basic"
								emphasis="low"
								onClick={handleDelete}
							>
								Delete
							</Tag>
						)}
						<Tag
							kind="primary"
							size="medium"
							shape="basic"
							emphasis="low"
							onClick={handleSave}
						>
							Save
						</Tag>
					</Stack>
				</Box>
			</Box>
		</Form>
	)
}
