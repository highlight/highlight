import Button from '@components/Button/Button/Button'
import { getPlayerEventIcon } from '@pages/Player/StreamElement/StreamElement'
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings'

interface Props {
	count: number
	eventType: string
	onClick?: React.MouseEventHandler<HTMLElement>
}

const EventCount = ({ count, eventType, onClick }: Props) => {
	const Icon = getPlayerEventIcon(eventType)
	return (
		<Button
			className={''}
			type="text"
			trackingId="ViewEventDetail"
			onClick={onClick}
		>
			<span
				className={''}
				style={{
					background: `var(${
						// @ts-ignore
						TimelineAnnotationColors[eventType]
					})`,
				}}
			>
				{Icon}
			</span>
			{getTimelineEventDisplayName(eventType || '')}
			{count > 1 && ` x ${count}`}
		</Button>
	)
}

export default EventCount
