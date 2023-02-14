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
		<Routes>
			<Route path="*" element={<SetupPage integrated={integrated} />} />
			<Route
				path=":step"
				element={<SetupPage integrated={integrated} />}
			/>
		</Routes>
	)
}

export default SetupRouter
