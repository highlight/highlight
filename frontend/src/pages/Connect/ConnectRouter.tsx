import { Route, Routes } from 'react-router-dom'

import InkeepChatButton from './SetupInkeepChatButton'
import { NewSetupPage } from './NewSetupPage'
import { ConnectPage } from './ConnectPage'
import { Helmet } from 'react-helmet'

export const ConnectRouter = () => {
	return (
		<>
			<Helmet>
				<title>Connect</title>
			</Helmet>
			<Routes>
				<Route path="new" element={<NewSetupPage />} />
				<Route path=":language?/:platform?" element={<ConnectPage />} />
			</Routes>
			<InkeepChatButton />
		</>
	)
}
