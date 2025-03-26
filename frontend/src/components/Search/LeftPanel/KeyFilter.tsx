import {
	Badge,
	IconSolidCheveronDown,
	Stack,
	IconSolidCheckCircle,
	IconSolidCheveronRight,
	ComboboxSelect,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'

import { useGetKeysLazyQuery } from '@/graph/generated/hooks'
import { Button } from '@components/Button'
import LoadingBox from '@/components/LoadingBox'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'

import * as style from './Filter.css'

type Props = {
	product: ProductType
	startDate: Date
	endDate: Date
	onSelect: (keys: string[]) => void
	selectedKeys: string[]
}

export const KeyFilter: React.FC<Props> = ({
	product,
	startDate,
	endDate,
	onSelect,
	selectedKeys,
}) => {
	const { projectId } = useProjectId()
	const [expanded, setExpanded] = useState(true)
	const [keyQuery, setKeyQuery] = useState('')
	const debouncedQuery = useDebouncedValue(keyQuery) || ''

	const [getKeys, { data, loading }] = useGetKeysLazyQuery()

	const comboBoxOptions = useMemo(() => {
		const options = loading
			? undefined
			: data?.keys.map((key) => ({
					key: key.name,
					render: (
						<Text
							lines="1"
							cssClass={style.selectOption}
							title={key.name}
						>
							{key.name}
						</Text>
					),
				}))

		return options
	}, [loading, data?.keys])

	const handleDeselect = (key: string) => {
		onSelect(selectedKeys.filter((k) => k !== key))
	}

	useEffect(() => {
		getKeys({
			variables: {
				product_type: product,
				project_id: projectId!,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedQuery,
			},
		})
	}, [debouncedQuery, startDate, endDate, product, projectId, getKeys])

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
					Attributes
				</Button>
			</Stack>
			{expanded && (
				<Stack gap="8" pl="8">
					<ComboboxSelect
						label="Attributes"
						queryPlaceholder="Search attributes..."
						onChange={onSelect}
						valueRender="Find..."
						loadingRender={<LoadingBox />}
						value={selectedKeys}
						options={comboBoxOptions}
						cssClass={style.selectButton}
						popoverCssClass={style.selectPopover}
						onChangeQuery={setKeyQuery}
					/>
					{selectedKeys.map((key) => {
						return (
							<Stack
								key={key}
								direction="row"
								gap="4"
								alignItems="center"
								justifyContent="flex-start"
								width="full"
								cursor="pointer"
								onClick={() => handleDeselect(key)}
							>
								<div
									className={style.checkbox}
									style={{
										backgroundColor:
											vars.theme.interactive.fill.primary
												.enabled,
									}}
								>
									<IconSolidCheckCircle color="white" />
								</div>
								<Badge label={key} title={key} lines="1" />
							</Stack>
						)
					})}
				</Stack>
			)}
		</Stack>
	)
}
