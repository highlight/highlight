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
import { ValueCombobox } from '@/pages/Graphing/Combobox'

import moment from 'moment'
import { HeaderDivider } from '@/pages/Graphing/Dashboard'

interface Props {
	dashboardId: string
}

export const VariablesBar: React.FC<Props> = ({ dashboardId }) => {
	const { values, variables, setCurrentValue } =
		useGraphingVariables(dashboardId)

	const [showVariablesModal, setShowVariablesModal] = useState(false)

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
							variables.map((v, idx) => {
								return (
									<>
										<Text>{v.key}:</Text>
										<Box cssClass={style.variableInput}>
											{!v.productType ? (
												<Form.Input
													name={`value-${idx}`}
													defaultValue={values.get(
														v.key,
													)}
													onBlur={(e) => {
														setCurrentValue(
															v.key,
															e.target.value,
														)
													}}
													autoComplete="off"
												/>
											) : (
												<ValueCombobox
													selection={
														values.get(v.key) ?? ''
													}
													setSelection={(
														selection: string,
													) => {
														setCurrentValue(
															v.key,
															selection,
														)
													}}
													searchConfig={{
														productType:
															v.productType,
														startDate: moment()
															.subtract(
																30,
																'days',
															)
															.toDate(),
														endDate:
															moment().toDate(),
													}}
													keyName={v.field ?? ''}
													label={`value-${idx}`}
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
							Dashboard variables
						</Button>
					</Stack>
				</Stack>
			</Form>
		</>
	)
}
