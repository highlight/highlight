import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

const QueryBuilderPage = lazy(
	() => import('../../pages/Internal/QueryBuilderPage'),
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
				path="query-builder"
				element={
					<Suspense fallback={null}>
						<QueryBuilderPage />
					</Suspense>
				}
			/>
			<Route
				path="*"
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
