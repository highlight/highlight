import { Box, Text } from '@highlight-run/ui'
import moment from 'moment'
import React from 'react'

import { LinkButton } from '@/components/LinkButton'
import { TraceError } from '@/graph/generated/schemas'

type Props = {
	errors: TraceError[]
}

export const TraceErrors: React.FC<Props> = ({ errors }) => {
	if (!errors.length) {
		return <Box>No errors...</Box>
	}

	return (
		<Box my="10">
			<Box display="flex" gap="4" flexDirection="column">
				{errors?.map((error, idx) => (
					<Box
						key={idx}
						borderRadius="6"
						border="secondary"
						padding="8"
						display="flex"
						alignItems="center"
						gap="8"
						flexDirection="row"
						justifyContent="space-between"
					>
						<Box display="flex" gap="12" flexDirection="column">
							<Text size="medium">{error.event}</Text>
							<Text color="weak">
								{moment(error.timestamp).format()}
							</Text>
						</Box>
						<LinkButton
							to={`/errors/${error.error_group_secure_id}`}
							size="small"
							trackingId="trace-error_see-more"
						>
							See more
						</LinkButton>
					</Box>
				))}
			</Box>
		</Box>
	)
}
