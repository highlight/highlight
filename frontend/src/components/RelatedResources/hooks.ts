import { makeVar, useReactiveVar } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

export type RelatedError = {
	type: 'error'
	id: string
	instanceId: string
}
export type RelatedSession = {
	type: 'session'
	id: string
}
export type RelatedTrace = {
	type: 'trace'
	id: string
}
export type RelatedResource = RelatedError | RelatedSession | RelatedTrace

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
			resource = JSON.parse(
				decodeURIComponent(resourceParam),
			) as RelatedResource
		}

		setResource(resource)
	}, [searchParams])

	const set = (resource: RelatedResource) => {
		searchParams.set(
			RELATED_RESOURCE_PARAM,
			encodeURIComponent(JSON.stringify(resource)),
		)
		setSearchParams(Object.fromEntries(searchParams.entries()))
		setResource(resource)
	}

	const remove = () => {
		searchParams.delete(RELATED_RESOURCE_PARAM)
		setSearchParams(Object.fromEntries(searchParams.entries()))
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
