import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type RelatedResourceType = 'session' | 'error' | 'trace'
export type RelatedResource = { type: RelatedResourceType; id: string }

const RELATED_RESOURCE_PARAM = 'related_resources'

export const useRelatedResources = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [resources, setResources] = useState<RelatedResource[]>([])

	// Parse the URL parameters on component mount
	useEffect(() => {
		const resourcesParam = searchParams.get(RELATED_RESOURCE_PARAM)
		let resources: RelatedResource[] = []

		if (resourcesParam) {
			resources = resourcesParam.split(',').map((resource) => {
				const [type, id] = resource.split(':')

				return {
					type: type as RelatedResourceType,
					id,
				}
			})
		}

		setResources(resources)
	}, [searchParams])

	const push = (type: RelatedResourceType, id: string) => {
		const newResources = [...resources, { type, id }]
		setSearchParams({
			[RELATED_RESOURCE_PARAM]: newResources
				.map(({ type, id }) => `${type}:${id}`)
				.join(','),
		})
	}

	const pop = () => {
		const newResources = resources.slice(0, -1)
		setSearchParams({
			[RELATED_RESOURCE_PARAM]: newResources
				.map(({ type, id }) => `${type}:${id}`)
				.join(','),
		})
	}

	return {
		resources,
		push,
		pop,
	}
}
