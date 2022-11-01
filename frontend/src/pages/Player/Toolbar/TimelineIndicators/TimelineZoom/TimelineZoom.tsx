import { Box, IconButton, MinusSmIcon, PlusSmIcon } from '@highlight-run/ui'

import * as style from './style.css'

interface Props {
	isHidden?: boolean
	zoom: (byPercent: number) => void
}
const PERCENTAGE_STEP = 25

const TimelineZoom: React.FC<Props> = ({ isHidden, zoom }) => {
	return (
		<Box
			cssClass={style.zoomButtons}
			border="neutral"
			visibility={isHidden ? 'hidden' : 'visible'}
		>
			<IconButton
				onClick={() => zoom(PERCENTAGE_STEP)}
				variant="secondary"
				icon={<PlusSmIcon />}
			/>
			<IconButton
				onClick={() => zoom(-PERCENTAGE_STEP)}
				variant="secondary"
				icon={<MinusSmIcon />}
			/>
		</Box>
	)
}

export default TimelineZoom
