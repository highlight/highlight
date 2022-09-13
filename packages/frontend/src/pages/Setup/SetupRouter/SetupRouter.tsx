import SetupPage from '@pages/Setup/SetupPage'
import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

interface Props {
	integrated: boolean
}

const SetupRouter = ({ integrated }: Props) => {
	const { path } = useRouteMatch()

	return (
		<>
			<Switch>
				<Route exact path={path}>
					<SetupPage integrated={integrated} />
				</Route>
				<Route path={`${path}/:step`}>
					<SetupPage integrated={integrated} />
				</Route>
			</Switch>
		</>
	)
}

export default SetupRouter
