import { isIndexedDBEnabled, setIndexedDBEnabled } from '@util/db'
import { Checkbox } from 'antd'
import React from 'react'

import { FieldsBox } from '@/components/FieldsBox/FieldsBox'

export const PlayerForm = () => {
	const [checked, setChecked] = React.useState<boolean>(isIndexedDBEnabled())

	React.useEffect(() => {
		setIndexedDBEnabled(checked)
	}, [checked])

	return (
		<>
			<h1>Player Settings</h1>
			<FieldsBox id="player-settings">
				<h3>App Settings</h3>
				<form>
					<p>
						IndexedDB Browser Cache is used to preload all data in
						Highlight and speed up repeated loading, but it can
						increase memory usage.
					</p>
					<Checkbox
						checked={checked}
						onChange={(e) => {
							setChecked(e.target.checked)
						}}
					>
						Use IndexedDB Cache
					</Checkbox>
				</form>
			</FieldsBox>
		</>
	)
}
