import Button from '@components/Button/Button/Button'
import SvgLogInIcon from '@icons/LogInIcon'
import { useApplicationContext } from '@routers/ProjectRouter/context/ApplicationContext'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import styles from './DemoWorkspaceButton.module.scss'

interface Props {
	integrated: boolean
}

/**
 * The application ID we use internally e.g. for our backend, database, etc.
 */
export const DEMO_WORKSPACE_APPLICATION_ID = '0'
/**
 * The application ID we show in the URL. This should be used instead of `DEMO_WORKSPACE_APPLICATION_ID` when user-facing.
 * */
export const DEMO_WORKSPACE_PROXY_APPLICATION_ID = 'demo'

const DemoWorkspaceButton = ({ integrated }: Props) => {
	const navigate = useNavigate()
	const { pathname } = useLocation()
	const { currentProject } = useApplicationContext()

	const [, path] = pathname.split('/').filter((token) => token.length)

	if (integrated && currentProject?.id !== DEMO_WORKSPACE_APPLICATION_ID) {
		return null
	}

	return (
		<Button
			className={styles.demoWorkspaceButton}
			type="primary"
			trackingId="DemoWorkspace"
			onClick={() => {
				navigate(`/${DEMO_WORKSPACE_PROXY_APPLICATION_ID}/${path}`)
			}}
		>
			<SvgLogInIcon /> Visit Demo Workspace
		</Button>
	)
}

export default DemoWorkspaceButton
