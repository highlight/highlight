import useLocalStorage from '@rehooks/local-storage'

/**
 * Gets configuration for the Error Page.
 */
const useErrorPageConfiguration = () => {
	const [showLeftPanel, setShowLeftPanel] = useLocalStorage<boolean>(
		'highlightErrorPageShowLeftPanel',
		false,
	)

	return {
		showLeftPanel,
		setShowLeftPanel,
	}
}

export default useErrorPageConfiguration
