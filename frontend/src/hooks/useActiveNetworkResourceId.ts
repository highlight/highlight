import { NumberParam, useQueryParam } from 'use-query-params'

export const NETWORK_RESOURCE_PARAM = 'network-resource-id'

export function useActiveNetworkResourceId() {
	const [activeNetworkResourceId, setActiveNetworkResourceId] = useQueryParam(
		NETWORK_RESOURCE_PARAM,
		NumberParam,
	)

	return { activeNetworkResourceId, setActiveNetworkResourceId }
}
