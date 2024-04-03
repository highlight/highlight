import { makeVar, useReactiveVar } from '@apollo/client'
import useLocalStorage from '@rehooks/local-storage'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

export type RelatedError = {
	type: 'error'
	secureId: string
	instanceId: string
}
export type RelatedSession = {
	type: 'session'
	secureId: string
	[PlayerSearchParameters.errorId]?: string
	[PlayerSearchParameters.log]?: string
	[PlayerSearchParameters.tsAbs]?: string
}
export type RelatedTrace = {
	type: 'trace'
	id: string
	spanID?: string
}
export type RelatedLogs = {
	type: 'logs'
	query: string
	startDate: string
	endDate: string
	logCursor?: string
}
export type RelatedResource =
	| RelatedError
	| RelatedSession
	| RelatedTrace
	| RelatedLogs

const LOCAL_STORAGE_WIDTH_KEY = 'related-resource-panel-width'
const RELATED_RESOURCE_PARAM = 'related_resource'

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
			const resource = JSON.parse(
				decodeURIComponent(resourceParam),
			) as RelatedResource

			setResource(resource)
		} else {
			setResource(null)
			panelPaginationVar(null)
		}
	}, [searchParams])

	const set = (
		resource: RelatedResource,
		pagination: PanelPagination | null = null,
	) => {
		searchParams.set(
			RELATED_RESOURCE_PARAM,
			encodeURIComponent(JSON.stringify(resource)),
		)

		setSearchParams(Object.fromEntries(searchParams.entries()))
		setResource(resource)
		panelPaginationVar(pagination)
	}

	const remove = () => {
		searchParams.delete(RELATED_RESOURCE_PARAM)
		setSearchParams(Object.fromEntries(searchParams.entries()))
		setResource(null)
		panelPaginationVar(null)
	}

	const setPanelWidth = (width: number) => {
		panelWidthVar(width)
		setLocalStorageWidth(width)
	}

	const setPanelPagination = (pagination: PanelPagination) => {
		panelPaginationVar(pagination)
	}

	return {
		resource,
		set,
		remove,
		panelWidth,
		setPanelWidth,
		panelPagination,
		setPanelPagination,
	}
}
