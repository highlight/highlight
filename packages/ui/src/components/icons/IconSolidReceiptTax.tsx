import React from 'react'

import { IconProps } from './types'

export const IconSolidReceiptTax = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill={props.color}
				fillRule="evenodd"
				d="M5 2a2 2 0 0 0-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 0 0-2-2H5Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6.207.293a1 1 0 0 0-1.414 0l-6 6a1 1 0 1 0 1.414 1.414l6-6a1 1 0 0 0 0-1.414ZM12.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
