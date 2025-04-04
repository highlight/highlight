import { ReactElement, useState } from 'react'

import {
	useGetAverageSessionLengthQuery,
	useGetNewUsersCountQuery,
} from '../../graph/generated/hooks'

function InternalPage(): ReactElement<any> {
	const [value, setValue] = useState('foobar')
	const {} = useGetNewUsersCountQuery({
		variables: { lookback_days: 30, project_id: '1' },
	})
	const {} = useGetAverageSessionLengthQuery({
		variables: { lookback_days: 30, project_id: '1' },
	})

	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				gap: '8px',
			}}
		>
			<label>
				Password without a value attribute
				<input type="password" name="" id="" />
			</label>
			<label>
				Password with a value attribute
				<input
					type="password"
					name=""
					id=""
					value={value}
					onChange={(e) => {
						setValue(e.target.value)
					}}
				/>
			</label>
			<input type="text" />
		</div>
	)
}

export default InternalPage
