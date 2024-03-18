import React from 'react'

import { IconProps } from './types'

export const IconSolidMap = ({ size = '1em', ...props }: IconProps) => {
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
				d="m12 1.586-4 4v12.828l4-4V1.586ZM3.707 3.293A1 1 0 0 0 2 4v10a1 1 0 0 0 .293.707L6 18.414V5.586L3.707 3.293Zm14 2L14 1.586v12.828l2.293 2.293A1 1 0 0 0 18 16V6a1 1 0 0 0-.293-.707Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
