import { makeVar, useReactiveVar } from '@apollo/client'
import useLocalStorage from '@rehooks/local-storage'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

type RelatedResourceCommon = {
	type:
		| 'error'
		| 'session'
		| 'trace'
		| 'logs'
		| 'errors'
		| 'sessions'
		| 'traces'
	canGoBack?: boolean
}

type QueryableResource = {
	type: 'logs' | 'errors' | 'sessions' | 'traces'
	query: string
	startDate: string
	endDate: string
}

export type RelatedError = RelatedResourceCommon & {
	type: 'error'
	secureId: string
	instanceId: string
}

export type RelatedSession = RelatedResourceCommon & {
	type: 'session'
	secureId: string
	[PlayerSearchParameters.errorId]?: string
	[PlayerSearchParameters.log]?: string
	[PlayerSearchParameters.tsAbs]?: string
}

export type RelatedTrace = RelatedResourceCommon & {
	type: 'trace'
	id: string
	timestamp: string
	spanID?: string
}

export type RelatedLogs = RelatedResourceCommon &
	QueryableResource & {
		type: 'logs'
		logCursor?: string
	}

export type RelatedTraces = RelatedResourceCommon &
	QueryableResource & {
		type: 'traces'
	}

export type RelatedErrors = RelatedResourceCommon &
	QueryableResource & {
		type: 'errors'
	}

export type RelatedSessions = RelatedResourceCommon &
	QueryableResource & {
		type: 'sessions'
	}

export type RelatedResource =
	| RelatedError
	| RelatedSession
	| RelatedTrace
	| RelatedLogs
	| RelatedTraces
	| RelatedErrors
	| RelatedSessions

const LOCAL_STORAGE_WIDTH_KEY = 'related-resource-panel-width'
export const RELATED_RESOURCE_PARAM = 'related_resource'

const localStorageWidth = localStorage.getItem(LOCAL_STORAGE_WIDTH_KEY)
const panelWidthVar = makeVar<number>(
	localStorageWidth ? parseInt(localStorageWidth) : 75,
)

type PanelPagination = {
	currentIndex: number
	resources: RelatedResource[]
	onChange?: (resource: RelatedResource) => void
}
const panelPaginationVar = makeVar<PanelPagination | null>(null)

export const useRelatedResource = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [resource, setResource] = useState<RelatedResource | null>(null)
	const panelWidth = useReactiveVar(panelWidthVar)
	const panelPagination = useReactiveVar(panelPaginationVar)
	const [_, setLocalStorageWidth] = useLocalStorage(
		LOCAL_STORAGE_WIDTH_KEY,
		panelWidth,
	)

	useEffect(() => {
		const resourceParam = searchParams.get(RELATED_RESOURCE_PARAM)

		if (resourceParam) {
			let innerString: string
			try {
				innerString = atob(resourceParam)
			} catch {
				innerString = decodeURIComponent(resourceParam)
			}
			const resource = JSON.parse(innerString) as RelatedResource

			setResource(resource)
		} else {
			setResource(null)
			panelPaginationVar(null)
		}
	}, [searchParams])

	const setPanelWidth = useCallback(
		(width: number) => {
			panelWidthVar(width)
			setLocalStorageWidth(width)
		},
		[setLocalStorageWidth],
	)

	const setPanelPagination = (pagination: PanelPagination) => {
		panelPaginationVar(pagination)
	}

	const set = useCallback(
		(
			newResource: RelatedResource,
			pagination: PanelPagination | null = null,
		) => {
			// Enable back button on nested related resources
			if (
				!!resource &&
				resource.type !== newResource.type &&
				newResource.canGoBack === undefined
			) {
				newResource.canGoBack = true
			}

			searchParams.set(
				RELATED_RESOURCE_PARAM,
				btoa(JSON.stringify(newResource)), // setSearchParams encodes the string
			)

			setSearchParams(Object.fromEntries(searchParams.entries()))
			setResource(newResource)

			if (pagination !== null) {
				panelPaginationVar(pagination)
			}
		},
		[resource, searchParams, setSearchParams],
	)

	const remove = useCallback(() => {
		searchParams.delete(RELATED_RESOURCE_PARAM)
		setSearchParams(Object.fromEntries(searchParams.entries()))

		setResource(null)
		panelPaginationVar(null)
	}, [searchParams, setSearchParams])

	return {
		resource,
		panelPagination,
		panelWidth,
		set,
		remove,
		setPanelWidth,
		setPanelPagination,
	}
}
