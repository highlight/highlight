import React from 'react'

import { IconProps } from './types'

export const IconOutlineChartPie = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M11.667 2.31a1 1 0 0 1 .333.745V12h8.945a1 1 0 0 1 .994 1.11C21.386 18.11 17.148 22 12 22 6.477 22 2 17.523 2 12c0-5.148 3.89-9.386 8.89-9.939a1 1 0 0 1 .777.249ZM10 4.252A8 8 0 1 0 19.748 14H11a1 1 0 0 1-1-1V4.252Zm4.423-1.556a1 1 0 0 1 .91-.127 10.025 10.025 0 0 1 6.098 6.098A1 1 0 0 1 20.488 10H15a1 1 0 0 1-1-1V3.512a1 1 0 0 1 .423-.816ZM16 5.07V8h2.93A8.044 8.044 0 0 0 16 5.07Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
