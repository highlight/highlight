import { Popover, PopoverProps } from 'antd'
import { PropsWithChildren } from 'react'

import style from './ExplanatoryPopover.module.scss'

const ExplanatoryPopover: React.FC<PropsWithChildren<PopoverProps>> = ({
	content,
	children,
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
			{children}
		</Popover>
	)
}

export default ExplanatoryPopover
