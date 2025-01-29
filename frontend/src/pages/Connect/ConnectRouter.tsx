import { Route, Routes } from 'react-router-dom'

import InkeepChatButton from './SetupInkeepChatButton'
import { NewConnectPage } from './NewConnectPage'
import { ConnectPage } from './ConnectPage'
import { Helmet } from 'react-helmet'

export const ConnectRouter = () => {
	return (
		<>
			<Helmet>
				<title>Connect</title>
			</Helmet>
			<Routes>
				<Route path="new" element={<NewConnectPage />} />
				<Route path=":language?/:platform?" element={<ConnectPage />} />
			</Routes>
			<InkeepChatButton />
		</>
	)
}
