import { useEffect, useState } from 'react'

import { useGetAdminQuery } from '../../graph/generated/hooks'

const useFeatureFlag = (feature: Feature) => {
	const { data } = useGetAdminQuery({
		skip: false,
	})
	const [hasAccessToFeature, setHasAccessToFeature] = useState(false)

	useEffect(() => {
		if (data) {
			const flight = Flights[feature]

			if (flight.includes(data.admin?.id || '')) {
				setHasAccessToFeature(true)
			} else {
				setHasAccessToFeature(false)
			}
		}
	}, [data, feature])

	return { hasAccessToFeature }
}

export default useFeatureFlag

export enum Feature {}

/**
 * A mapping between features and users that have access to them. Users are identified with their Admin ID.
 */
const Flights: { [key in Feature]: string[] } = {}
