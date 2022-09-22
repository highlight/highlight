import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { FrontContextProvider } from '@pages/FrontPlugin/Front/FrontContext'
import HighlightSessions from '@pages/FrontPlugin/components/HighlightSessions'

const FrontPlugin = () => {
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [])

	return (
		<FrontContextProvider>
			<Helmet>
				<title>Highlight Front</title>
			</Helmet>
			<HighlightSessions />
		</FrontContextProvider>
	)
}

export default FrontPlugin
