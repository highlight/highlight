import React from 'react'

import { IconProps } from './types'

export const IconOutlineArrowDown = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 2a1 1 0 0 1 1 1v15.586l5.293-5.293a1 1 0 0 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 1 1 1.414-1.414L11 18.586V3a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
