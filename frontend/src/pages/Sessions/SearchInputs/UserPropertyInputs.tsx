import { UserPropertyInput as UserPropertyInputType } from '@graph/schemas'
import { SearchParamsInput } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import React from 'react'
import { OptionsType, OptionTypeBase } from 'react-select'
import AsyncCreatableSelect from 'react-select/async-creatable'

import { PropertyOption } from '../../../components/Option/Option'
import Tooltip from '../../../components/Tooltip/Tooltip'
import { useGetUserSuggestionQuery } from '../../../graph/generated/hooks'
import SvgFaceIdIcon from '../../../static/FaceIdIcon'
import { useSearchContext } from '../SearchContext/SearchContext'
import inputStyles from './InputStyles.module.scss'
import { ContainsLabel } from './SearchInputUtil'

export const UserPropertyInput = ({ include }: { include: boolean }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { searchParams, setSearchParams } = useSearchContext()

	const { refetch } = useGetUserSuggestionQuery({ skip: true })

	const generateOptions = async (
		input: string,
	): Promise<OptionsType<OptionTypeBase> | void[]> => {
		const fetched = await refetch({
			project_id,
			query: input,
		})
		const suggestions = (fetched?.data?.property_suggestion ?? []).map(
			(f) => {
				return {
					label: f?.name + ': ' + f?.value,
					value: f?.value,
					name: f?.name,
					id: f?.id,
				}
			},
		)
		return suggestions
	}

	return (
		<div className={inputStyles.searchInput}>
			<AsyncCreatableSelect
				isMulti
				styles={{
					control: (provided) => ({
						...provided,
						borderColor: 'var(--color-gray-300)',
						borderRadius: 8,
						minHeight: 45,
					}),
					multiValue: (provided) => ({
						...provided,
						backgroundColor: 'var(--color-purple-100)',
					}),
					placeholder: (provided) => ({
						...provided,
						color: '#bfbfbf',
					}),
					valueContainer: (provided) => ({
						...provided,
						padding: 'var(--size-xSmall) var(--size-medium)',
					}),
				}}
				cacheOptions
				placeholder={`Select a user property to ${
					include ? 'include' : 'exclude'
				}...`}
				isClearable={false}
				defaultOptions
				onChange={(options) => {
					const newOptions: Array<UserPropertyInputType> =
						options?.map((o) => {
							if (!o.name) {
								o.name = 'contains'
								o.id = '-1'
							}
							return { id: o.id, name: o.name, value: o.value }
						}) ?? []
					if (include) {
						setSearchParams((params: SearchParamsInput) => {
							return { ...params, user_properties: newOptions }
						})
					} else {
						setSearchParams((params: SearchParamsInput) => {
							return {
								...params,
								excluded_properties: newOptions,
							}
						})
					}
				}}
				value={
					include
						? searchParams?.user_properties?.map((p) => {
								return {
									label: p.name + ': ' + p.value,
									value: p.value,
									name: p.name,
									id: p.id,
								}
						  })
						: searchParams?.excluded_properties?.map((p) => {
								return {
									label: p.name + ': ' + p.value,
									value: p.value,
									name: p.name,
									id: p.id,
								}
						  })
				}
				loadOptions={generateOptions}
				components={{
					DropdownIndicator: () => (
						<div className={inputStyles.iconWrapper}>
							<SvgFaceIdIcon />
						</div>
					),
					Option: (props) => <PropertyOption {...props} />,
					IndicatorSeparator: () => null,
				}}
				formatCreateLabel={ContainsLabel}
				createOptionPosition="first"
			/>
		</div>
	)
}

export const IdentifiedUsersSwitch = () => {
	const { searchParams, setSearchParams } = useSearchContext()

	return (
		<div>
			<Checkbox
				checked={!!searchParams.identified}
				onChange={(e: CheckboxChangeEvent) => {
					setSearchParams((params) => ({
						...params,
						identified: e.target.checked,
					}))
				}}
			>
				<span
					className={
						searchParams.identified
							? ''
							: inputStyles.checkboxUnselected
					}
				>
					Only show identified users
				</span>
			</Checkbox>
		</div>
	)
}

export const FirstTimeUsersSwitch = () => {
	const { searchParams, setSearchParams } = useSearchContext()

	return (
		<div>
			<Tooltip
				title="Show only your user's first recorded session"
				placement="left"
			>
				<Checkbox
					checked={!!searchParams.first_time}
					onChange={(e: CheckboxChangeEvent) => {
						setSearchParams((params) => ({
							...params,
							first_time: e.target.checked,
						}))
					}}
				>
					<span
						className={
							searchParams.first_time
								? ''
								: inputStyles.checkboxUnselected
						}
					>
						Only show new users
					</span>
				</Checkbox>
			</Tooltip>
		</div>
	)
}
