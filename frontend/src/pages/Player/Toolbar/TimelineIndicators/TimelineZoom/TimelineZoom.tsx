import { cmdKey } from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	Badge,
	Box,
	ButtonIcon,
	IconArrowsExpand,
	IconMinusSm,
	IconPlusSm,
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
							<Badge variant="grey" size="tiny" label={cmdKey} />
							<Badge variant="grey" size="tiny" label="Scroll" />
						</Box>
						<Text userSelect="none" color="n11">
							or
						</Text>
						<Badge
							variant="grey"
							size="tiny"
							label="Pinch"
							iconEnd={<IconArrowsExpand size={12} />}
						/>
					</>
				}
			>
				<ButtonIcon
					onClick={() => zoom(PERCENTAGE_STEP)}
					kind="secondary"
					size="minimal"
					emphasis="none"
					icon={<IconPlusSm />}
				/>
				<ButtonIcon
					onClick={() => zoom(-PERCENTAGE_STEP)}
					kind="secondary"
					size="minimal"
					emphasis="none"
					icon={<IconMinusSm />}
				/>
			</ExplanatoryPopover>
		</Box>
	)
}

export default TimelineZoom
