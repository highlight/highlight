import {
	Badge,
	IconSolidCheveronDown,
	Stack,
	IconSolidCheckCircle,
	IconSolidCheveronRight,
	ComboboxSelect,
	Tag,
	Text,
	Tooltip,
	IconSolidInformationCircle,
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
import { STANDARD_FILTERS } from './constants'

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
		const optionKeys =
			data?.keys.map((key) => key.name) || STANDARD_FILTERS[product]

		const options = loading
			? undefined
			: optionKeys.map((key) => ({
					key: key,
					render: (
						<Text
							lines="1"
							cssClass={style.selectOption}
							title={key}
						>
							{key}
						</Text>
					),
				}))

		return options
	}, [data?.keys, product, loading])

	const handleDeselect = (key: string) => {
		onSelect(selectedKeys.filter((k) => k !== key))
	}

	useEffect(() => {
		if (expanded && !!debouncedQuery) {
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
		}
	}, [
		debouncedQuery,
		startDate,
		endDate,
		product,
		projectId,
		getKeys,
		expanded,
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
					Attributes
				</Button>
				<Tooltip
					trigger={
						<Tag
							kind="secondary"
							size="medium"
							shape="basic"
							emphasis="low"
							iconRight={<IconSolidInformationCircle />}
						/>
					}
				>
					Manage the saved attributes for quick access and
					recommendations to be used.
				</Tooltip>
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
						creatableRender={(key) => (
							<Text
								lines="1"
								cssClass={style.selectOption}
								title={key}
							>
								{key}
							</Text>
						)}
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
