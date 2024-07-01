import React from 'react'

import { IconProps } from './types'

export const IconOutlineMail = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7Zm2 2.869V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.869l-6.336 4.223a3 3 0 0 1-3.328 0L4 9.87Zm16-2.404-7.445 4.963a1 1 0 0 1-1.11 0L4 7.465V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v.465Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
