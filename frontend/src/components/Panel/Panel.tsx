import { Box, Dialog } from '@highlight-run/ui/components'
import { useHotkeys } from 'react-hotkeys-hook'

import * as styles from './Panel.css'

type Props = React.PropsWithChildren & {
	open: boolean
}

export const Panel: React.FC<Props> = ({ children, open }) => {
	const dialogStore = Dialog.useStore({
		open,
	})

	useHotkeys('esc', () => {
		dialogStore.hide()
	})

	return (
		<Dialog
			store={dialogStore}
			modal={false}
			autoFocusOnShow={false}
			className={styles.panel}
			backdrop={<Box style={{ background: 'rgba(0, 0, 0, 0.1)' }} />}
		>
			{children}
		</Dialog>
	)
}
