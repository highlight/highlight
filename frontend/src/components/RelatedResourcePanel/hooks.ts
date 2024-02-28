import { makeVar, useReactiveVar } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

type RelatedResourceType = 'session' | 'error' | 'trace'
export type RelatedResource = { type: RelatedResourceType; id: string }

const LOCAL_STORAGE_WIDTH_KEY = 'related-resource-panel-width'
const RELATED_RESOURCE_PARAM = 'related_resource'

const localStorageWidth = localStorage.getItem(LOCAL_STORAGE_WIDTH_KEY)
const panelWidthVar = makeVar<number>(
	localStorageWidth ? parseInt(localStorageWidth) : 75,
)

export const useRelatedResource = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [resource, setResource] = useState<RelatedResource | null>(null)
	const panelWidth = useReactiveVar(panelWidthVar)
	const [_, setLocalStorageWidth] = useLocalStorage(
		LOCAL_STORAGE_WIDTH_KEY,
		panelWidth,
	)

	// Parse the URL parameters on component mount
	useEffect(() => {
		const resourceParam = searchParams.get(RELATED_RESOURCE_PARAM)
		let resource: RelatedResource | null = null

		if (resourceParam) {
			const [type, id] = resourceParam.split(':')

			resource = {
				type: type as RelatedResourceType,
				id,
			}
		}

		setResource(resource)
	}, [searchParams])

	const set = (type: RelatedResourceType, id: string) => {
		const newResource = { type, id }
		setSearchParams({
			...searchParams,
			[RELATED_RESOURCE_PARAM]: `${type}:${id}`,
		})
		setResource(newResource)
	}

	const remove = () => {
		setSearchParams({
			...searchParams,
			[RELATED_RESOURCE_PARAM]: undefined,
		})
		setResource(null)
	}

	const setPanelWidth = (width: number) => {
		panelWidthVar(width)
		setLocalStorageWidth(width)
	}

	return {
		resource,
		set,
		remove,
		panelWidth,
		setPanelWidth,
	}
}
