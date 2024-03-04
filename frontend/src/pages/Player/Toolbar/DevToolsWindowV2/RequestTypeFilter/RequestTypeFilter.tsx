import {
	Badge,
	Box,
	IconSolidFilter,
	MultiSelectButton,
} from '@highlight-run/ui/components'
import {
	getNetworkResourcesDisplayName,
	ICountPerRequestType,
	RequestType,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useMemo } from 'react'

type Props = {
	requestTypes: RequestType[]
	parsedResources: any
	setRequestTypes: (values: RequestType[]) => void
}

const FILTER_LABEL = 'Type'

const RequestTypeFilter = ({
	requestTypes,
	setRequestTypes,
	parsedResources,
}: Props) => {
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
			websocket: 0,
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

	const handleRequestTypeChange = (valueNames: string[]) => {
		const allPreviouslySelected = requestTypes.includes(RequestType.All)
		const allCurrentlySelected = valueNames.includes(RequestType.All)
		const clearOtherTypes = !allPreviouslySelected && allCurrentlySelected
		const deselectAllType = allPreviouslySelected && valueNames.length > 1

		if (!valueNames.length || clearOtherTypes) {
			return setRequestTypes([RequestType.All])
		}

		const updatedRequestTypes = valueNames.filter(
			(name) => !deselectAllType || name !== RequestType.All,
		) as RequestType[]

		setRequestTypes(updatedRequestTypes)
	}

	const options = Object.entries(RequestType).map(
		([displayName, requestName]) => ({
			key: requestName,
			clearsOnClick: requestName === RequestType.All,
			render: (
				<Box
					display="flex"
					justifyContent="space-between"
					width="full"
					gap="16"
				>
					<span>{displayName}</span>
					<Badge
						variant="gray"
						size="small"
						label={countPerRequestType[requestName].toString()}
					/>
				</Box>
			),
		}),
	)

	const valueRender = () => {
		if (requestTypes.includes(RequestType.All)) {
			return FILTER_LABEL
		}

		if (requestTypes.length === 1) {
			return `${FILTER_LABEL}: ${getNetworkResourcesDisplayName(
				requestTypes[0],
			)}`
		}

		return `${FILTER_LABEL}: ${requestTypes.length} selected`
	}

	return (
		<MultiSelectButton
			label={FILTER_LABEL}
			icon={<IconSolidFilter />}
			defaultValue={RequestType.All}
			value={requestTypes}
			valueRender={valueRender}
			options={options}
			onChange={handleRequestTypeChange}
		/>
	)
}

export { RequestTypeFilter }
