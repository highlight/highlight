import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

const QueryBuilderPage = lazy(
	() => import('../../pages/Internal/QueryBuilderPage'),
)
const OpenSearchQueryPage = lazy(
	() => import('../../pages/Internal/OpenSearchQueryPage'),
)
const InternalPage = lazy(() => import('../../pages/Internal/InternalPage'))

const InternalRouter = () => {
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	return (
		<Routes>
			<Route
				path="/_internal/query-builder"
				element={
					<Suspense fallback={null}>
						<QueryBuilderPage />
					</Suspense>
				}
			/>
			<Route
				path="/_internal/opensearch-query-builder"
				element={
					<Suspense fallback={null}>
						<OpenSearchQueryPage />
					</Suspense>
				}
			/>
			<Route
				path="/_internal"
				element={
					<Suspense fallback={null}>
						<InternalPage />
					</Suspense>
				}
			/>
		</Routes>
	)
}

export default InternalRouter
