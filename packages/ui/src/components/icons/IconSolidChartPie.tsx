import React from 'react'

import { IconProps } from './types'

export const IconSolidChartPie = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 10a8 8 0 0 1 8-8v8h8a8 8 0 1 1-16 0Z"
			/>
			<path
				fill="currentColor"
				d="M12 2.252A8.014 8.014 0 0 1 17.748 8H12V2.252Z"
			/>
		</svg>
	)
}
