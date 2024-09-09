import { Modal } from '@components/Modal/ModalV2'
import { toast } from '@components/Toaster'
import { useUpsertVisualizationMutation } from '@graph/hooks'
import { Box, Button, Form, Stack, Table } from '@highlight-run/ui/components'
import React, { useState } from 'react'

import { useProjectId } from '@/hooks/useProjectId'
import {
	Variable,
	VariableType,
	Visualization,
} from '@/graph/generated/schemas'
import { useSearchParams } from 'react-router-dom'

interface Props {
	dashboardId: string
	showModal: boolean
	onHideModal: () => void
	settings: Visualization | undefined
}

export const VariablesModal: React.FC<Props> = ({
	dashboardId,
	showModal,
	onHideModal,
	settings,
}) => {
	const { projectId } = useProjectId()

	const [upsertViz, upsertContext] = useUpsertVisualizationMutation({})

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

	console.log('settings', settings, showModal)

	if (!showModal || !settings) {
		return null
	}

	console.log('rendering!')

	return (
		<InnerModal
			loading={upsertContext.loading}
			settings={settings}
			onHideModal={onHideModal}
			onSubmit={onSubmit}
		/>
	)
}

interface ModalProps {
	loading: boolean
	settings: Visualization
	onHideModal: () => void
	onSubmit: (variables: Variable[]) => void
}

export const getQueryKey = (key: string): string => {
	return `var-${key}`
}

const InnerModal = ({ onHideModal, onSubmit, settings }: ModalProps) => {
	const [variables, setVariables] = useState(settings.variables)
	const setVariable = (
		idx: number,
		field: 'key' | 'defaultValue',
		value: string,
	) => {
		const varsCopy = [...variables]
		varsCopy[idx] = { ...variables[idx], [field]: value }
		setVariables(varsCopy)
	}

	const addVariable = () => {
		const varsCopy = [...variables]
		varsCopy.push({
			defaultValue: '',
			key: '',
			type: VariableType.PlainText,
		})
		setVariables(varsCopy)
		const valsCopy = [...currentValues]
		valsCopy.push('')
		setCurrentValues(valsCopy)
	}

	const removeVariable = (idx: number) => {
		const varsCopy = [...variables]
		varsCopy.splice(idx, 1)
		setVariables(varsCopy)
		const valsCopy = [...currentValues]
		valsCopy.splice(idx, 1)
		setCurrentValues(valsCopy)
	}

	const [params, setParams] = useSearchParams()

	const initialCurrentValues: string[] = []
	settings.variables.forEach((v) => {
		initialCurrentValues.push(
			params.get(getQueryKey(v.key)) ?? v.defaultValue,
		)
	})
	const [currentValues, setCurrentValues] = useState(initialCurrentValues)

	const setCurrentValue = (idx: number, value: string) => {
		const valsCopy = [...currentValues]
		valsCopy[idx] = value
		setCurrentValues(valsCopy)
	}

	const formStore = Form.useStore({
		defaultValues: {
			variables: settings.variables,
		},
	})

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		setParams(
			(prev) => {
				currentValues.forEach((v, idx) => {
					console.log('variables', variables, idx)
					const variable = variables[idx]
					if (v !== variable.defaultValue) {
						prev.set(getQueryKey(variable.key), v)
					} else {
						prev.delete(getQueryKey(variable.key))
					}
				})
				return prev
			},
			{ replace: true },
		)
		onSubmit(variables)
	}

	return (
		<Modal title="Variables" onClose={onHideModal}>
			<Stack py="8" px="12" style={{ minWidth: 600, maxWidth: 1000 }}>
				<Form onSubmit={handleSubmit} store={formStore}>
					<Table>
						<Table.Head>
							<Table.Row>
								<Table.Cell>Name</Table.Cell>
								<Table.Cell>Default value</Table.Cell>
								<Table.Cell>Current value</Table.Cell>
								<Table.Cell></Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{variables.map((variable, i) => (
								<Table.Row
									key={i}
									// gridColumns={['3rem', '1fr', '10rem']}
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
										/>
									</Table.Cell>
									<Table.Cell>
										<Form.Input
											name={`default-value-${i}`}
											value={variable.defaultValue}
											onChange={(e) => {
												setVariable(
													i,
													'defaultValue',
													e.target.value,
												)
											}}
											autoComplete="off"
										/>
									</Table.Cell>
									<Table.Cell>
										<Form.Input
											name={`current-value-${i}`}
											value={currentValues[i]}
											onChange={(e) => {
												setCurrentValue(
													i,
													e.target.value,
												)
											}}
											autoComplete="off"
										/>
									</Table.Cell>
									<Table.Cell>
										<Button
											onClick={() => {
												removeVariable(i)
											}}
										>
											Remove
										</Button>
									</Table.Cell>
								</Table.Row>
							))}
							<Table.Row>
								<Button
									onClick={() => {
										addVariable()
									}}
								>
									Add variable
								</Button>
							</Table.Row>
						</Table.Body>
					</Table>
					<Box borderTop="dividerWeak" my="12" width="full" />
					<Box
						display="flex"
						justifyContent="flex-end"
						gap="8"
						pt="12"
					>
						<Button
							kind="secondary"
							emphasis="medium"
							onClick={onHideModal}
						>
							Cancel
						</Button>
						<Button kind="primary" type="submit">
							Save
						</Button>
					</Box>
				</Form>
			</Stack>
		</Modal>
	)
}
