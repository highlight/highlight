import moment from 'moment'

import Tooltip from '../Tooltip/Tooltip'

interface Props {
	datetime: string
}

const RelativeTime = ({ datetime }: Props) => {
	const momentDatetime = moment(datetime)

	return (
		<Tooltip
			title={momentDatetime.format('MMMM Do YYYY, h:mm A')}
			align={{ offset: [0, 8] }}
			mouseEnterDelay={0}
		>
			<span>{momentDatetime.fromNow()}</span>
		</Tooltip>
	)
}

export default RelativeTime
