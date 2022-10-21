import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import { getErrorBody } from '@util/errors/errorUtils'
import React from 'react'

interface Props {
	errorGroup?: Maybe<Pick<ErrorGroup, 'event'>>
}

const ErrorBody: React.FC<React.PropsWithChildren<Props>> = ({
	errorGroup,
}) => {
	const body = getErrorBody(errorGroup?.event)

	return (
		<Box border="neutral" borderRadius="medium">
			<Box display="flex" alignItems="stretch">
				<Box borderRight="neutral" borderBottom="neutral" p="medium">
					<div>Users</div>
				</Box>
				<Box borderRight="neutral" borderBottom="neutral" p="medium">
					<div>Instances</div>
				</Box>
				<Box borderRight="neutral" borderBottom="neutral" p="medium">
					<div>Last/first occurrence</div>
				</Box>
				<Box borderBottom="neutral" p="medium">
					<div>Last 30 days</div>
				</Box>
			</Box>
			<Box p="medium">
				<code>{body}</code>
			</Box>
		</Box>
	)
}

export default ErrorBody
