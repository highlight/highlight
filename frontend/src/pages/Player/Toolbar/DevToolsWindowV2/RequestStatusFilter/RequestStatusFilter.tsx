import {
	Badge,
	Box,
	IconSolidFilter,
	MultiSelectButton,
} from '@highlight-run/ui/components'
import {
	ICountPerRequestStatus,
	RequestStatus,
	RequestType,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useMemo } from 'react'

type Props = {
	requestStatuses: RequestStatus[]
	requestTypes: RequestType[]
	parsedResources: any
	setRequestStatuses: (values: RequestStatus[]) => void
}

const FILTER_LABEL = 'Status'

const RequestStatusFilter = ({
	requestStatuses,
	setRequestStatuses,
	parsedResources,
	requestTypes,
}: Props) => {
	/* Count request per type (XHR, etc.) */
	/* Count request per http status (200, etc.) */
	const countPerRequestStatus = useMemo(() => {
		const count: ICountPerRequestStatus = {
			All: 0,
			'1XX': 0,
			'2XX': 0,
			'3XX': 0,
			'4XX': 0,
			'5XX': 0,
			Unknown: 0,
		}

		parsedResources
			.filter(
				(r: any) =>
					requestTypes.includes(RequestType.All) ||
					requestTypes.includes(r.initiatorType),
			)
			.forEach((request: any) => {
				const status: number | undefined =
					request?.requestResponsePairs?.response?.status

				count['All'] += 1
				if (status) {
					switch (true) {
						case status >= 100 && status < 200:
							count['1XX'] += 1
							break
						case status >= 200 && status < 300:
							count['2XX'] += 1
							break
						case status >= 300 && status < 400:
							count['3XX'] += 1
							break
						case status >= 400 && status < 500:
							count['4XX'] += 1
							break
						case status >= 500 && status < 600:
							count['5XX'] += 1
							break
						default:
							count['Unknown'] += 1
							break
					}
				} else {
					// this is a network request with no status code
					// if fetch, consider unknown. otherwise assume it is 2xx
					if (request.initiatorType === RequestType.Fetch) {
						count['Unknown'] += 1
					} else if (
						request.initiatorType === RequestType.WebSocket
					) {
						count['1XX'] += 1
					} else {
						count['2XX'] += 1
					}
				}
			})

		return count
	}, [parsedResources, requestTypes])

	const handleRequestTypeChange = (valueNames: string[]) => {
		const allPreviouslySelected = requestStatuses.includes(
			RequestStatus.All,
		)
		const allCurrentlySelected = valueNames.includes(RequestStatus.All)
		const clearOtherTypes = !allPreviouslySelected && allCurrentlySelected
		const deselectAllType = allPreviouslySelected && valueNames.length > 1

		if (!valueNames.length || clearOtherTypes) {
			return setRequestStatuses([RequestStatus.All])
		}

		//-- Set type to be the requestName value --//
		const updatedRequestStatuses = valueNames.filter(
			(name) => !deselectAllType || name !== RequestStatus.All,
		) as RequestStatus[]

		setRequestStatuses(updatedRequestStatuses)
	}

	const options = Object.entries(RequestStatus).map(
		([statusKey, statusValue]) => ({
			key: statusValue,
			clearsOnClick: statusKey === RequestStatus.All,
			render: (
				<Box
					display="flex"
					justifyContent="space-between"
					width="full"
					gap="8"
				>
					<span>{statusKey}</span>
					<Badge
						variant="gray"
						size="small"
						label={countPerRequestStatus[statusValue].toString()}
					/>
				</Box>
			),
		}),
	)

	const selected =
		!!requestStatuses.length && !requestStatuses.includes(RequestStatus.All)

	return (
		<MultiSelectButton
			label={FILTER_LABEL}
			icon={<IconSolidFilter />}
			defaultValue={options[0].key}
			value={requestStatuses}
			selected={selected}
			options={options}
			onChange={handleRequestTypeChange}
		/>
	)
}

export { RequestStatusFilter }
