import { MultiSelectButton, IconSolidFilter } from '@highlight-run/ui'
import { RequestType } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { ICountPerRequestType } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import React, { useMemo } from 'react'

const RequestTypeFilter = ({
	requestTypes,
	setRequestTypes,
	parsedResources,
}: any) => {
	const handleRequestTypeChange = (valueNames: string[]) => {
		const allPreviouslySelected = requestTypes.includes(RequestType.All)
		const allCurrentlySelected = valueNames.includes(RequestType.All)
		const clearOtherTypes = !allPreviouslySelected && allCurrentlySelected
		const deselectAllType = allPreviouslySelected && valueNames.length > 1

		if (!valueNames.length || clearOtherTypes) {
			return setRequestTypes([RequestType.All])
		}

		//-- Set type to be the requestName value --//
		const updatedRequestTypes = valueNames.reduce(
			(agg: string[], name: string) => {
				if (deselectAllType && name === RequestType.All) {
					return agg
				}

				return agg.concat(name)
			},
			[] as string[],
		)

		setRequestTypes(updatedRequestTypes)
	}

	/* Count request per type (XHR, etc.) */
	const countPerRequestType = useMemo(() => {
		const count: ICountPerRequestType = {
			All: 0,
			link: 0,
			script: 0,
			other: 0,
			xmlhttprequest: 0,
			css: 0,
			iframe: 0,
			fetch: 0,
			img: 0,
		}

		parsedResources.forEach((request: any) => {
			const requestType =
				request.initiatorType as keyof ICountPerRequestType

			count['All'] += 1
			/* Only count request types defined in ICountPerRequestType, e.g. skip 'beacon' */
			if (count.hasOwnProperty(request.initiatorType)) {
				count[requestType] += 1
			}
		})

		return count
	}, [parsedResources])

	const options = Object.entries(RequestType).map(
		([displayName, requestName]) => ({
			key: requestName,
			render: `${displayName} (${countPerRequestType[requestName]})`,
		}),
	)

	return (
		<MultiSelectButton
			label="Type"
			icon={<IconSolidFilter />}
			defaultValue={RequestType.All}
			value={requestTypes}
			options={options}
			onChange={handleRequestTypeChange}
		/>
	)
}

export { RequestTypeFilter }
