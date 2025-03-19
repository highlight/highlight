import {
	Badge,
	Box,
	IconSolidCheveronUp,
	IconSolidCheveronDown,
	Stack,
	Text,
	IconSolidCheckCircle,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useState } from 'react'

import { Button } from '@components/Button'
import { formatNumber } from '@/pages/Graphing/components/Graph'

import * as style from './Filter.css'

type ValueSuggestion = {
	value: string
	count: number
	rank: number
}

type Props = {
	filter: string
	values: ValueSuggestion[]
	onSelect: (filter: string, value: string, add: boolean) => void
	selectedValues: Record<string, boolean>
}

// TODO(spenny): numbers are from day, so may not be accurate to the current timeframe

export const Filter: React.FC<Props> = ({
	filter,
	values,
	onSelect,
	selectedValues,
}) => {
	const [expanded, setExpanded] = useState(true)
	const handleSelect = (value: string, selected: boolean) => {
		onSelect(filter, value, selected)
	}

	return (
		<Stack gap="4">
			<Box display="flex" width="full">
				<Button
					kind="secondary"
					emphasis="low"
					onClick={(e) => {
						e.stopPropagation()
						setExpanded(!expanded)
					}}
					trackingId="logs_toggle-expand-all_click"
				>
					<Box
						alignItems="center"
						justifyContent="space-between"
						display="flex"
						flexDirection="row"
						gap="4"
						width="full"
					>
						{filter}
						{expanded ? (
							<IconSolidCheveronUp />
						) : (
							<IconSolidCheveronDown />
						)}
					</Box>
				</Button>
			</Box>
			{expanded && (
				<Stack gap="8" pl="8">
					{values.map((value) => {
						const selected = selectedValues[value.value]

						return (
							<Stack
								key={value.value}
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								gap="4"
								cursor="pointer"
								onClick={() =>
									handleSelect(value.value, !selected)
								}
							>
								<Stack
									direction="row"
									gap="4"
									alignItems="center"
									justifyContent="flex-start"
								>
									<div
										className={style.checkbox}
										style={{
											backgroundColor: selected
												? vars.theme.interactive.fill
														.primary.enabled
												: 'white',
										}}
									>
										<IconSolidCheckCircle color="white" />
									</div>
									<Badge
										label={value.value}
										title={value.value}
										lines="1"
									/>
								</Stack>

								<Text color="weak">
									{formatNumber(value.count)}
								</Text>
							</Stack>
						)
					})}
				</Stack>
			)}
		</Stack>
	)
}
