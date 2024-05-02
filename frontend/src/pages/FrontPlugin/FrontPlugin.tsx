import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { HighlightSessions } from '@pages/FrontPlugin/components/HighlightSessions'
import { FrontContextProvider } from '@pages/FrontPlugin/Front/FrontContext'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet'

// TODO: fix this page
const FrontPlugin = () => {
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

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
