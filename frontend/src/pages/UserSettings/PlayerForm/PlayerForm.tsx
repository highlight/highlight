import {
	INDEXEDDB_ENABLED_LOCAL_STORAGE_PREFIX,
	indexeddbEnabled,
} from '@util/db'
import { Checkbox } from 'antd'
import React from 'react'

import styles from './PlayerForm.scss'

export const PlayerForm = () => {
	const [useIndexedDB, setUseIndexedDB] =
		React.useState<boolean>(indexeddbEnabled)

	return (
		<>
			<h3>App Settings</h3>
			<form>
				<p>
					IndexedDB Browser Cache is used to preload all data in
					highlight and speedup repeated loading, but can increase
					memory usage.
				</p>
				<div className={styles.fieldRow}>
					<div className={styles.fieldKey}>
						<Checkbox
							checked={useIndexedDB}
							onChange={(e) => {
								const checked = e.target.checked
								setUseIndexedDB(checked)
								const env = import.meta.env.DEV ? 'dev' : 'prod'
								localStorage.setItem(
									`${INDEXEDDB_ENABLED_LOCAL_STORAGE_PREFIX}${env}`,
									checked ? 'true' : 'false',
								)
							}}
						>
							Use IndexedDB Cache
						</Checkbox>
					</div>
				</div>
			</form>
		</>
	)
}
