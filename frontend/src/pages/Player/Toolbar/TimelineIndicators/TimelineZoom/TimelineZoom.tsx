import { cmdKey } from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidArrowsExpand,
	IconSolidMinusSm,
	IconSolidPlusSm,
	Text,
	Tooltip,
} from '@highlight-run/ui'

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
			border="secondary"
			visibility={isHidden ? 'hidden' : 'visible'}
		>
			<Tooltip
				trigger={
					<>
						<ButtonIcon
							onClick={() => zoom(PERCENTAGE_STEP)}
							kind="secondary"
							size="minimal"
							emphasis="none"
							icon={<IconSolidPlusSm />}
						/>
						<ButtonIcon
							onClick={() => zoom(-PERCENTAGE_STEP)}
							kind="secondary"
							size="minimal"
							emphasis="none"
							icon={<IconSolidMinusSm />}
						/>
					</>
				}
				timeout={1000}
			>
				<Box display="flex" gap="2" alignItems="center">
					<Badge variant="gray" size="small" label={cmdKey} />
					<Badge variant="gray" size="small" label="Scroll" />
					<Text userSelect="none" color="n11">
						or
					</Text>
					<Badge
						variant="gray"
						size="small"
						label="Pinch"
						iconEnd={<IconSolidArrowsExpand size={12} />}
					/>
				</Box>
			</Tooltip>
		</Box>
	)
}

export default TimelineZoom
