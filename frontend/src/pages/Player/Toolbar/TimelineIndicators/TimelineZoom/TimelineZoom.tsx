import { cmdKey } from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidArrowsExpand,
	IconSolidMinusSm,
	IconSolidPlusSm,
	Text,
} from '@highlight-run/ui'
import ExplanatoryPopover from '@pages/Player/Toolbar/ExplanatoryPopover/ExplanatoryPopover'

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
			<ExplanatoryPopover
				content={
					<>
						<Box display="flex" gap="2">
							<Badge variant="gray" size="small" label={cmdKey} />
							<Badge variant="gray" size="small" label="Scroll" />
						</Box>
						<Text userSelect="none" color="n11">
							or
						</Text>
						<Badge
							variant="gray"
							size="small"
							label="Pinch"
							iconEnd={<IconSolidArrowsExpand size={12} />}
						/>
					</>
				}
			>
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
			</ExplanatoryPopover>
		</Box>
	)
}

export default TimelineZoom
