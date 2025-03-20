import {
	Badge,
	IconSolidCheveronUp,
	IconSolidCheveronDown,
	Stack,
	IconSolidCheckCircle,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useState } from 'react'

import { Button } from '@components/Button'

import * as style from './Filter.css'

type ValueSuggestion = {
	value: string
	selected: boolean
}

type Props = {
	filter: string
	values: ValueSuggestion[]
	onSelect: (filter: string, value: string, add: boolean) => void
}

// TODO(spenny): numbers are from day, so may not be accurate to the current timeframe

export const Filter: React.FC<Props> = ({ filter, values, onSelect }) => {
	const [expanded, setExpanded] = useState(true)
	const handleSelect = (value: string, selected: boolean) => {
		onSelect(filter, value, selected)
	}

	return (
		<Stack gap="4" pb="8">
			<Button
				kind="secondary"
				emphasis="low"
				onClick={(e) => {
					e.stopPropagation()
					setExpanded(!expanded)
				}}
				trackingId="expand-filter-button"
				iconRight={
					expanded ? (
						<IconSolidCheveronUp />
					) : (
						<IconSolidCheveronDown />
					)
				}
				className={style.filterButton}
			>
				{filter}
			</Button>
			{expanded && (
				<Stack gap="8" pl="8">
					{values.map((value) => {
						return (
							<Stack
								key={value.value}
								direction="row"
								gap="4"
								alignItems="center"
								justifyContent="flex-start"
								width="full"
								cursor="pointer"
								onClick={() =>
									handleSelect(value.value, !value.selected)
								}
							>
								<div
									className={style.checkbox}
									style={{
										backgroundColor: value.selected
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
						)
					})}
				</Stack>
			)}
		</Stack>
	)
}
