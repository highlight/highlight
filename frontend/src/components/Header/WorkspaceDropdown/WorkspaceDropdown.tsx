import clsx from 'clsx'

import { generateRandomColor } from '../../../util/color'
import styles from './WorkspaceDropdown.module.css'

type Props = {
	projectName: string
	className?: string
}

export const MiniWorkspaceIcon = ({ projectName, className }: Props) => {
	return (
		<div>
			<div
				className={clsx(styles.workspaceIcon, className)}
				style={{
					backgroundColor: generateRandomColor(projectName ?? ''),
				}}
			>
				{projectName[0]?.toUpperCase() ?? 'H'}
			</div>
		</div>
	)
}
