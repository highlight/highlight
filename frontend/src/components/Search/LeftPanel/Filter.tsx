import {
	Badge,
	IconSolidCheveronDown,
	Stack,
	IconSolidCheckCircle,
	IconSolidCheveronRight,
	ComboboxSelect,
	Text,
	Box,
	Menu,
	IconSolidDotsHorizontal,
	IconSolidArrowUp,
	IconSolidArrowDown,
	IconSolidXCircle,
	IconSolidPlusCircle,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'

import { Button } from '@components/Button'
import LoadingBox from '@/components/LoadingBox'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useGetKeyValuesLazyQuery } from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'

import * as style from './Filter.css'

type ValueSuggestion = {
	value: string
	selected: boolean
}

type Props = {
	product: ProductType
	filter: string
	values: ValueSuggestion[]
	startDate: Date
	endDate: Date
	onSelect: (filter: string, value: string, add: boolean) => void
	onKeyAdd?: () => void
	onKeyRemove?: () => void
	onKeyMoveUp?: () => void
	onKeyMoveDown?: () => void
}

export const Filter: React.FC<Props> = ({
	product,
	filter,
	values,
	startDate,
	endDate,
	onSelect,
	onKeyAdd,
	onKeyRemove,
	onKeyMoveUp,
	onKeyMoveDown,
}) => {
	const { projectId } = useProjectId()
	const [expanded, setExpanded] = useState(true)
	const [valueQuery, setValueQuery] = useState('')
	const debouncedQuery = useDebouncedValue(valueQuery) || ''

	const [getKeyValues, { data, loading }] = useGetKeyValuesLazyQuery()

	const selectedValues = useMemo(() => {
		return values
			.filter((value) => value.selected)
			.map((value) => value.value)
	}, [values])

	const comboBoxOptions = useMemo(() => {
		const options = loading
			? undefined
			: data?.key_values.map((value) => ({
					key: value,
					render: (
						<Text
							lines="1"
							cssClass={style.selectOption}
							title={value}
						>
							{value}
						</Text>
					),
				}))

		return options
	}, [loading, data?.key_values])

	const handleSelect = (value: string, selected: boolean) => {
		onSelect(filter, value, selected)
	}

	const handleComboBoxSelect = (values: string[]) => {
		values.forEach((value) => {
			if (!selectedValues.includes(value)) {
				handleSelect(value, true)
			}
		})

		selectedValues.forEach((value) => {
			if (!values.includes(value)) {
				handleSelect(value, false)
			}
		})
	}

	useEffect(() => {
		getKeyValues({
			variables: {
				product_type: product,
				project_id: projectId!,
				key_name: filter,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedQuery,
				count: 10,
			},
		})
	}, [
		debouncedQuery,
		startDate,
		endDate,
		product,
		projectId,
		getKeyValues,
		filter,
	])

	return (
		<Stack gap="4" pb="8">
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
			>
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
							<IconSolidCheveronDown />
						) : (
							<IconSolidCheveronRight />
						)
					}
					className={style.filterButton}
				>
					{filter}
				</Button>
				<Box display="flex" alignItems="center" gap="4">
					{selectedValues.length > 0 && (
						<Badge
							label={String(selectedValues.length)}
							variant="purple"
							px="4"
						/>
					)}
					<Menu placement="bottom-end">
						<Menu.Button
							size="minimal"
							emphasis="low"
							kind="secondary"
							icon={<IconSolidDotsHorizontal />}
							onClick={(e: any) => e.stopPropagation()}
						/>
						<Menu.List>
							{onKeyAdd && (
								<Menu.Item
									onClick={(e) => {
										e.stopPropagation()
										onKeyAdd!()
									}}
								>
									<IconSolidPlusCircle size={16} />
									Add filter
								</Menu.Item>
							)}
							<Menu.Item
								disabled={!onKeyMoveUp}
								onClick={(e) => {
									e.stopPropagation()
									onKeyMoveUp!()
								}}
							>
								<IconSolidArrowUp size={16} />
								Move filter up
							</Menu.Item>
							<Menu.Item
								disabled={!onKeyMoveDown}
								onClick={(e) => {
									e.stopPropagation()
									onKeyMoveDown!()
								}}
							>
								<IconSolidArrowDown size={16} />
								Move filter down
							</Menu.Item>
							<Menu.Item
								disabled={!onKeyRemove}
								onClick={(e) => {
									e.stopPropagation()
									onKeyRemove!()
								}}
							>
								<IconSolidXCircle size={16} />
								Hide filter
							</Menu.Item>
						</Menu.List>
					</Menu>
				</Box>
			</Stack>
			{expanded && (
				<Stack gap="8" pl="8">
					<ComboboxSelect
						label="Values"
						queryPlaceholder="Search values..."
						onChange={handleComboBoxSelect}
						valueRender="Find..."
						loadingRender={<LoadingBox />}
						value={selectedValues}
						options={comboBoxOptions}
						cssClass={style.selectButton}
						popoverCssClass={style.selectPopover}
						onChangeQuery={setValueQuery}
					/>
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
