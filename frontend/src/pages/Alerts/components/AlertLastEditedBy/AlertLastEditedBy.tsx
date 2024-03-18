import { Admin } from '@graph/schemas'
import moment from 'moment'

import styles from './AlertLastEditedBy.module.css'

interface Props {
	adminId: string
	lastEditedTimestamp: string
	allAdmins: Admin[]
	loading: boolean
}

const AlertLastEditedBy = ({
	adminId,
	lastEditedTimestamp,
	allAdmins,
}: Props) => {
	const admin = allAdmins.find((admin) => admin?.id === adminId)
	const displayName = admin?.name || 'Highlight'

	return (
		<div className={styles.container}>
			<div className={styles.adminContainer}>
				Updated by <span className={styles.value}>{displayName}</span> •{' '}
				{moment(lastEditedTimestamp).fromNow()}
			</div>
		</div>
	)
}

export default AlertLastEditedBy
