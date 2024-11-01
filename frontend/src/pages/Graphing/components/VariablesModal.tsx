import { Modal } from '@components/Modal/ModalV2'
import { toast } from '@components/Toaster'
import { useUpsertVisualizationMutation } from '@graph/hooks'
import {
	Box,
	Button,
	Form,
	IconSolidDotsHorizontal,
	IconSolidPlus,
	Menu,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import React, { useState } from 'react'

import { useProjectId } from '@/hooks/useProjectId'
import { SuggestionType, Variable } from '@/graph/generated/schemas'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { SUGGESTION_TYPES } from '@/pages/Graphing/constants'
import { Combobox, ValueCombobox } from '@/pages/Graphing/Combobox'

import * as style from './VariablesModal.css'

import moment from 'moment'

interface Props {
	dashboardId: string
	showModal: boolean
	onHideModal: () => void
}

export const VariablesModal: React.FC<Props> = ({
	dashboardId,
	showModal,
	onHideModal,
}) => {
	const { projectId } = useProjectId()

	const [upsertViz] = useUpsertVisualizationMutation({})

	const onSubmit = (variables: Variable[]) => {
		upsertViz({
			variables: {
				visualization: {
					id: dashboardId,
					projectId,
					variables,
				},
			},
			onError: (e) => {
				toast.error(`Error updating dashboard: ${e.message}`)
			},
			optimisticResponse: {
				upsertVisualization: dashboardId,
			},
			update(cache) {
				const vizId = cache.identify({
					id: dashboardId,
					__typename: 'Visualization',
				})
				cache.modify({
					id: vizId,
					fields: {
						variables() {
							return variables
						},
					},
				})
			},
		})
		onHideModal()
	}

	const { variables, loading } = useGraphingVariables(dashboardId)

	if (!showModal || loading) {
		return null
	}

	return (
		<InnerModal
			initialVariables={variables}
			onHideModal={onHideModal}
			onSubmit={onSubmit}
		/>
	)
}

interface ModalProps {
	initialVariables: Variable[]
	onHideModal: () => void
	onSubmit: (variables: Variable[]) => void
}

export const getQueryKey = (key: string): string => {
	return `var-${key}`
}

const InnerModal = ({
	onHideModal,
	onSubmit,
	initialVariables,
}: ModalProps) => {
	const [variables, setVariables] = useState(initialVariables)
	const setVariable = (
		idx: number,
		field: 'key' | 'defaultValues' | 'field' | 'suggestionType',
		value: string | string[] | undefined,
	) => {
		const varsCopy = [...variables]
		varsCopy[idx] = { ...variables[idx], [field]: value }
		setVariables(varsCopy)
	}

	const addVariable = () => {
		const varsCopy = [...variables]
		varsCopy.push({
			defaultValues: [],
			key: '',
			suggestionType: SuggestionType.Value,
		})
		setVariables(varsCopy)
	}

	const removeVariable = (idx: number) => {
		const varsCopy = [...variables]
		varsCopy.splice(idx, 1)
		setVariables(varsCopy)
	}

	const formStore = Form.useStore({
		defaultValues: {
			variables: initialVariables,
		},
	})

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		onSubmit(variables)
	}

	return (
		<Modal
			title="Variables"
			onClose={onHideModal}
			closeOnClickOutside={false}
		>
			<Stack style={{ minWidth: 800, maxWidth: 1000 }}>
				<Form onSubmit={handleSubmit} store={formStore}>
					<Table noBorder>
						<Table.Head>
							<Table.Row
								gridColumns={[
									'1fr',
									'1fr',
									'1fr',
									'1fr',
									'40px',
								]}
								className={style.tableHeader}
							>
								<Table.Cell>
									<Text
										size="xSmall"
										weight="medium"
										color="secondaryContentText"
									>
										Name
									</Text>
								</Table.Cell>
								<Table.Cell>
									<Text
										size="xSmall"
										weight="medium"
										color="secondaryContentText"
									>
										Suggestion type
									</Text>
								</Table.Cell>
								<Table.Cell>
									<Text
										size="xSmall"
										weight="medium"
										color="secondaryContentText"
									>
										Suggestion field
									</Text>
								</Table.Cell>
								<Table.Cell>
									<Text
										size="xSmall"
										weight="medium"
										color="secondaryContentText"
									>
										Default value
									</Text>
								</Table.Cell>
								<Table.Cell></Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{variables.map((variable, i) => (
								<Table.Row
									key={i}
									gridColumns={[
										'1fr',
										'1fr',
										'1fr',
										'1fr',
										'40px',
									]}
									alignItems="center"
								>
									<Table.Cell>
										<Form.Input
											name={`name-${i}`}
											value={variable.key}
											onChange={(e) => {
												setVariable(
													i,
													'key',
													e.target.value,
												)
											}}
											autoComplete="off"
											placeholder="Variable name"
										/>
									</Table.Cell>
									<Table.Cell>
										<OptionDropdown<SuggestionType>
											options={SUGGESTION_TYPES}
											selection={variable.suggestionType}
											setSelection={(suggestionType) => {
												setVariable(
													i,
													'suggestionType',
													suggestionType,
												)
											}}
										/>
									</Table.Cell>
									<Table.Cell>
										{variable.suggestionType ===
											SuggestionType.Value && (
											<Combobox
												selection={variable.field ?? ''}
												setSelection={(
													selection: string,
												) => {
													setVariable(
														i,
														'field',
														selection,
													)
												}}
												searchConfig={{
													startDate: moment()
														.subtract(30, 'days')
														.toDate(),
													endDate: moment().toDate(),
												}}
											/>
										)}
									</Table.Cell>
									<Table.Cell>
										{variable.suggestionType ===
											SuggestionType.None && (
											<Form.Input
												name={`default-value-${i}`}
												value={
													variable.defaultValues[0]
												}
												onChange={(e) => {
													setVariable(
														i,
														'defaultValues',
														[e.target.value],
													)
												}}
												autoComplete="off"
												placeholder="Default value"
											/>
										)}
										{variable.suggestionType ===
											SuggestionType.Key && (
											<Combobox
												selection={
													variable.defaultValues
												}
												setSelection={(
													selection: string[],
												) => {
													setVariable(
														i,
														'defaultValues',
														selection,
													)
												}}
												searchConfig={{
													startDate: moment()
														.subtract(30, 'days')
														.toDate(),
													endDate: moment().toDate(),
												}}
											/>
										)}
										{variable.suggestionType ===
											SuggestionType.Value && (
											<ValueCombobox
												selection={
													variable.defaultValues
												}
												setSelection={(
													selection: string[],
												) => {
													setVariable(
														i,
														'defaultValues',
														selection,
													)
												}}
												searchConfig={{
													startDate: moment()
														.subtract(30, 'days')
														.toDate(),
													endDate: moment().toDate(),
												}}
												keyName={variable.field ?? ''}
											/>
										)}
									</Table.Cell>
									<Menu>
										<Menu.Button
											emphasis="low"
											kind="secondary"
											icon={
												<IconSolidDotsHorizontal
													size={14}
												/>
											}
										/>
										<Menu.List>
											<Menu.Item
												onClick={() => {
													removeVariable(i)
												}}
											>
												Delete
											</Menu.Item>
										</Menu.List>
									</Menu>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
					<Box borderTop="dividerWeak" my="4" width="full" />
					<Stack
						direction="row"
						justifyContent="space-between"
						pb="4"
						px="4"
					>
						<Button
							kind="secondary"
							emphasis="low"
							iconLeft={<IconSolidPlus />}
							onClick={() => {
								addVariable()
							}}
						>
							New variable
						</Button>
						<Box display="flex" justifyContent="flex-end" gap="8">
							<Button kind="primary" type="submit">
								Save
							</Button>
						</Box>
					</Stack>
				</Form>
			</Stack>
		</Modal>
	)
}
