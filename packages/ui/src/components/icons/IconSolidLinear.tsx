import React from 'react'

import { IconProps } from './types'

export const IconSolidLinear = ({ size = '1em', ...props }: IconProps) => {
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
				fill="#5E6AD2"
				d="m2.1 11.35 6.55 6.55a8.013 8.013 0 0 1-6.55-6.55ZM2 9.572 10.428 18a8.01 8.01 0 0 0 1.463-.214L2.214 8.109A8 8 0 0 0 2 9.572Zm.634-2.72 10.515 10.514a7.988 7.988 0 0 0 1.1-.577L3.21 5.75c-.22.351-.413.719-.577 1.1Zm1.29-2.066a8.006 8.006 0 1 1 11.29 11.29L3.924 4.786Z"
			/>
		</svg>
	)
}
