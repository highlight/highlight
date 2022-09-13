import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'

const InternalRouter = () => {
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	return (
		<Switch>
			<Suspense fallback={<></>}>
				<Route
					path="/_internal/query-builder"
					component={lazy(
						() => import('../../pages/Internal/QueryBuilderPage'),
					)}
				/>
				<Route
					path="/_internal/opensearch-query-builder"
					component={lazy(
						() =>
							import('../../pages/Internal/OpenSearchQueryPage'),
					)}
				/>
				<Route
					exact
					path="/_internal"
					component={lazy(
						() => import('../../pages/Internal/InternalPage'),
					)}
				/>
			</Suspense>
		</Switch>
	)
}

export default InternalRouter
