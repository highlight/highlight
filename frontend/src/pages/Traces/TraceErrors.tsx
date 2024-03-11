import { Box, Callout, Text } from '@highlight-run/ui/components'
import moment from 'moment'
import React, { useEffect } from 'react'

import { Button } from '@/components/Button'
import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { useTrace } from '@/pages/Traces/TraceProvider'
import analytics from '@/util/analytics'

export const TraceErrors: React.FC = () => {
	const { errors, traceId } = useTrace()
	const { set } = useRelatedResource()

	useEffect(() => {
		analytics.track('trace_errors_view')
	}, [traceId])

	if (!errors.length) {
		return (
			<Box mt="10" mx="auto" style={{ maxWidth: 300 }}>
				<Callout title="No errors">
					<Text>There are no errors associated with this trace.</Text>
				</Callout>
			</Box>
		)
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
						<Button
							onClick={() => {
								set({
									type: 'error',
									id: error.error_group_secure_id,
									instanceId: error.id,
								})
							}}
							size="small"
							trackingId="trace-error_see-more"
						>
							See more
						</Button>
					</Box>
				))}
			</Box>
		</Box>
	)
}
