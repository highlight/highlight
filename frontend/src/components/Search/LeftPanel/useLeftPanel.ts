import useLocalStorage from '@rehooks/local-storage'

const DISPLAY_SUFFIX = '-display-left-panel'

type Props = {
	key: string
}

type LeftPanelResponse = {
	displayLeftPanel: boolean
	setDisplayLeftPanel: (value: boolean) => void
}

export const useLeftPanel = ({ key }: Props): LeftPanelResponse => {
	const [displayLeftPanel, setDisplayLeftPanel] = useLocalStorage(
		`${key}${DISPLAY_SUFFIX}`,
		false,
	)

	return {
		displayLeftPanel,
		setDisplayLeftPanel,
	}
}
