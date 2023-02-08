import SetupPage from '@pages/Setup/SetupPage'
import analytics from '@util/analytics'
import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

interface Props {
	integrated: boolean
}

const SetupRouter = ({ integrated }: Props) => {
	useEffect(() => analytics.page(), [])

	return (
		<>
			<Routes>
				<Route path="*">
					<SetupPage integrated={integrated} />
				</Route>
				<Route path="/:step">
					<SetupPage integrated={integrated} />
				</Route>
			</Routes>
		</>
	)
}

export default SetupRouter
