import { useAuthContext } from '@authentication/AuthContext'
import useLocalStorage from '@rehooks/local-storage'

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
	const [showLeftPanel, setShowLeftPanel] = useLocalStorage<boolean>(
		'highlightErrorPageShowLeftPanel',
		false,
	)

	return isLoggedIn
		? {
				showLeftPanel,
				setShowLeftPanel,
		  }
		: DEFAULT_STATE
}

export default useErrorPageConfiguration
