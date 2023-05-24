import { useAuthContext } from '@/routers/AuthenticationRolerouter/context/AuthContext'
import useLocalStorage from '@rehooks/local-storage'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { useNumericProjectId } from '@/hooks/useProjectId'

const DEFAULT_STATE = {
	showLeftPanel: false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setShowLeftPanel: (_: boolean) => {},
}

/**
 * Gets configuration for the Error Page.
 */
const useErrorPageConfiguration = (): typeof DEFAULT_STATE => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useNumericProjectId()
	const [showLeftPanel, setShowLeftPanel] = useLocalStorage<boolean>(
		'highlightErrorPageShowLeftPanel',
		true,
	)

	return isLoggedIn || projectId === DEMO_PROJECT_ID
		? {
				showLeftPanel,
				setShowLeftPanel,
		  }
		: DEFAULT_STATE
}

export default useErrorPageConfiguration
