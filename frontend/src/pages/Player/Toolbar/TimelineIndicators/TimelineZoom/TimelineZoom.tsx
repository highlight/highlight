import { Box, IconButton, MinusSmIcon, PlusSmIcon } from '@highlight-run/ui'

import * as style from './style.css'

interface Props {
	isHidden?: boolean
}
const TimelineZoom: React.FC<Props> = ({ isHidden }) => {
	return (
		<Box
			cssClass={style.zoomButtons}
			border="neutral"
			visibility={isHidden ? 'hidden' : 'visible'}
		>
			<IconButton variant="secondary" icon={<PlusSmIcon />} />
			<IconButton variant="secondary" icon={<MinusSmIcon />} />
		</Box>
	)
}

export default TimelineZoom
