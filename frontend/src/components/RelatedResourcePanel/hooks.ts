import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type ResourceType = 'session' | 'error' | 'trace'

const RELATED_RESOURCE_PARAM = 'related_resources'

export const useRelatedResources = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [resources, setResources] = useState<
		Array<{ type: ResourceType; id: string }>
	>([])

	// Parse the URL parameters on component mount
	useEffect(() => {
		const resourcesParam = searchParams.get(RELATED_RESOURCE_PARAM)

		if (resourcesParam) {
			const resources = resourcesParam.split(',').map((resource) => {
				const [type, id] = resource.split(':')

				return {
					type: type as ResourceType,
					id,
				}
			})

			setResources(resources)
		}
	}, [searchParams])

	const push = (type: ResourceType, id: string) => {
		const newResources = [...resources, { type, id }]
		setResources(newResources)
		setSearchParams({
			[RELATED_RESOURCE_PARAM]: newResources
				.map(({ type, id }) => `${type}:${id}`)
				.join(','),
		})
	}

	const pop = (type: ResourceType) => {
		const newResources = resources.filter(
			(resource) => resource.type !== type,
		)
		setResources(newResources)
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
