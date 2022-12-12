import { UserPropertyInput } from '@graph/schemas'
import { SearchParamsInput } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { OptionsType, OptionTypeBase } from 'react-select'
import AsyncCreatableSelect from 'react-select/async-creatable'

import { PropertyOption } from '../../../components/Option/Option'
import { useGetTrackSuggestionQuery } from '../../../graph/generated/hooks'
import SvgTargetIcon from '../../../static/TargetIcon'
import { useSearchContext } from '../SearchContext/SearchContext'
import inputStyles from './InputStyles.module.scss'
import { ContainsLabel } from './SearchInputUtil'

export const TrackPropertyInput = ({
	include = true,
}: {
	include?: boolean
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { searchParams, setSearchParams } = useSearchContext()

	const { refetch } = useGetTrackSuggestionQuery({ skip: true })

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
		<div>
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
				placeholder={`Select a track property to ${
					include ? 'include' : 'exclude'
				}...`}
				isClearable={false}
				defaultOptions
				onChange={(options) => {
					const newOptions: Array<UserPropertyInput> =
						options?.map((o) => {
							if (!o.name) {
								o.name = 'contains'
								o.id = '-1'
							}
							return { id: o.id, name: o.name, value: o.value }
						}) ?? []

					if (include) {
						setSearchParams((params: SearchParamsInput) => {
							return { ...params, track_properties: newOptions }
						})
					} else {
						setSearchParams((params: SearchParamsInput) => {
							return {
								...params,
								excluded_track_properties: newOptions,
							}
						})
					}
				}}
				value={
					include
						? searchParams?.track_properties?.map((p) => {
								return {
									label: p.name + ': ' + p.value,
									value: p.value,
									name: p.name,
									id: p.id,
								}
						  })
						: searchParams?.excluded_track_properties?.map((p) => {
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
							<SvgTargetIcon />
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
