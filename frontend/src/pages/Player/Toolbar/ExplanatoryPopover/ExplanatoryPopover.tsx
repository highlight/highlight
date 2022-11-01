import { Box } from '@highlight-run/ui'
import { Popover, PopoverProps } from 'antd'
import { PropsWithChildren } from 'react'

import style from './ExplanatoryPopover.module.scss'

type Props = PopoverProps & {
	height?: number | string
}
const ExplanatoryPopover: React.FC<PropsWithChildren<Props>> = ({
	content,
	children,
	height,
	...popoverProps
}) => {
	return (
		<Popover
			content={content}
			overlayClassName={style.explanatoryPopoverOverlay}
			showArrow={false}
			align={{
				offset: [0, 8],
			}}
			{...popoverProps}
		>
			<Box
				style={{
					height: height ?? 'min-content', // explicit, because antd overvwrites class of the first child
				}}
			>
				{children}
			</Box>
		</Popover>
	)
}

export default ExplanatoryPopover
