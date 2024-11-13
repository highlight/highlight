import { Badge, Box, Heading, Stack } from '@highlight-run/ui/components'
import moment from 'moment'

import { RelatedResourceButtons } from '@/pages/Traces/RelatedResourceButtons'
import { useTrace } from '@/pages/Traces/TraceProvider'

export const TraceHeader = () => {
	const {
		traceName,
		durationString,
		startTime,
		endTime,
		traceId,
		secureSessionId,
		selectedSpan,
		errors,
	} = useTrace()

	return (
		<Stack direction="column" gap="12" pb="12">
			<Heading level="h4" lines="2" title={traceName}>
				{traceName}
			</Heading>
			<Stack gap="4" direction="row" alignItems="center">
				<Badge
					size="medium"
					variant="gray"
					label={moment(startTime).format('MMM D HH:mm:ss A')}
				/>
				<Badge size="medium" variant="gray" label={durationString} />
				<Box borderRight="divider" style={{ height: 12 }} />
				<RelatedResourceButtons
					traceId={traceId}
					secureSessionId={secureSessionId}
					disableErrors={!errors?.length}
					displayErrorTooltip={
						selectedSpan?.hasErrors && !errors?.length
					}
					startDate={new Date(startTime)}
					endDate={new Date(endTime)}
				/>
			</Stack>
		</Stack>
	)
}
