import { Badge, Heading, Stack } from '@highlight-run/ui/components'
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
		<Stack direction="column" gap="12" pt="16" pb="12" px="20">
			<Heading level="h4">{traceName}</Heading>
			<Stack direction="row" justifyContent="space-between">
				<Stack gap="4" direction="row">
					<Badge
						size="medium"
						variant="gray"
						label={moment(startTime).format('MMM D HH:mm:ss A')}
					/>
					<Badge
						size="medium"
						variant="gray"
						label={durationString}
					/>
				</Stack>
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
