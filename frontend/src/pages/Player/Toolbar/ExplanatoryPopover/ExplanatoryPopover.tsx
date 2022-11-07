import { Box } from '@highlight-run/ui'
import { Popover, PopoverProps } from 'antd'
import { PropsWithChildren } from 'react'

import style from './ExplanatoryPopover.module.scss'

type Props = PopoverProps

const ExplanatoryPopover: React.FC<PropsWithChildren<Props>> = ({
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
			mouseEnterDelay={1}
			{...popoverProps}
		>
			<Box
				style={{
					// explicit, because antd overvwrites class of the first child
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{children}
			</Box>
		</Popover>
	)
}

export default ExplanatoryPopover
