import { Route, Routes } from 'react-router-dom'

import InkeepChatButton from './SetupInkeepChatButton'
import { NewSetupPage } from './NewSetupPage'
import { ConnectPage } from './ConnectPage'

export const ConnectRouter = () => {
	return (
		<>
			<Routes>
				<Route path="new" element={<NewSetupPage />} />
				<Route path=":language?/:platform?" element={<ConnectPage />} />
			</Routes>
			<InkeepChatButton />
		</>
	)
}
