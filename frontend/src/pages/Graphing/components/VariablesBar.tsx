import {
	Box,
	Button,
	Form,
	IconSolidAdjustments,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import React, { useState } from 'react'

import * as style from './VariablesBar.css'
import { VariablesModal } from '@/pages/Graphing/components/VariablesModal'
import { useGraphingVariables } from '@/pages/Graphing/hooks/useGraphingVariables'
import { Combobox, ValueCombobox } from '@/pages/Graphing/Combobox'

import moment from 'moment'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'
import { SuggestionType } from '@/graph/generated/schemas'

interface Props {
	dashboardId: string
}

export const VariablesBar: React.FC<Props> = ({ dashboardId }) => {
	const { values, variables, setCurrentValues } =
		useGraphingVariables(dashboardId)

	const [showVariablesModal, setShowVariablesModal] = useState(false)

	const searchConfig = {
		startDate: moment().subtract(30, 'days').toDate(),
		endDate: moment().toDate(),
	}

	return (
		<>
			<VariablesModal
				dashboardId={dashboardId}
				showModal={showVariablesModal}
				onHideModal={() => {
					setShowVariablesModal(false)
				}}
			/>
			<Form>
				<Stack paddingLeft="12" paddingRight="8">
					<Stack
						direction="row"
						justifyContent="flex-start"
						alignItems="center"
						borderBottom="dividerWeak"
						py="6"
						cssClass={style.variablesBar}
						gap="8"
					>
						{variables &&
							variables.map((v, i) => {
								return (
									<>
										<Text color="secondaryContentText">
											{v.key}:
										</Text>
										<Box cssClass={style.variableInput}>
											{v.suggestionType ===
												SuggestionType.None && (
												<Form.Input
													name={`default-value-${i}`}
													value={values.get(v.key)}
													onChange={(e) => {
														setCurrentValues(
															v.key,
															[e.target.value],
														)
													}}
													autoComplete="off"
												/>
											)}
											{v.suggestionType ===
												SuggestionType.Key && (
												<Combobox
													selection={
														values.get(v.key) ?? []
													}
													setSelection={(
														selection: string[],
													) => {
														setCurrentValues(
															v.key,
															selection,
														)
													}}
													searchConfig={searchConfig}
												/>
											)}
											{v.suggestionType ===
												SuggestionType.Value && (
												<ValueCombobox
													selection={
														values.get(v.key) ?? []
													}
													setSelection={(
														selection: string[],
													) => {
														setCurrentValues(
															v.key,
															selection,
														)
													}}
													searchConfig={searchConfig}
													keyName={v.field ?? ''}
												/>
											)}
										</Box>
										<HeaderDivider />
									</>
								)
							})}
						<Button
							emphasis="low"
							kind="secondary"
							iconLeft={<IconSolidAdjustments size={14} />}
							onClick={() => {
								setShowVariablesModal(true)
							}}
						>
							Variables
						</Button>
					</Stack>
				</Stack>
			</Form>
		</>
	)
}
