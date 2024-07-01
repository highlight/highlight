import React from 'react'

import { IconProps } from './types'

export const IconSolidWifi = ({ size = '1em', ...props }: IconProps) => {
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
				fill="currentColor"
				fillRule="evenodd"
				d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 0 1 .808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 0 1-1.414 1.414ZM14.95 11.05a7 7 0 0 0-9.9 0 1 1 0 0 1-1.414-1.414 9 9 0 0 1 12.728 0 1 1 0 0 1-1.414 1.414Zm-2.83 2.83a3 3 0 0 0-4.242 0 1 1 0 0 1-1.415-1.415 5 5 0 0 1 7.072 0 1 1 0 0 1-1.415 1.415ZM9 16a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
