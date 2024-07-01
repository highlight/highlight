import React from 'react'

import { IconProps } from './types'

export const IconOutlineMap = ({ size = '1em', ...props }: IconProps) => {
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
				d="M14.553 3.106a1 1 0 0 1 .894 0l5.447 2.723A2 2 0 0 1 22 7.618v10.764a2 2 0 0 1-2.894 1.789L15 18.118l-5.553 2.776a1 1 0 0 1-.894 0l-5.447-2.723A2 2 0 0 1 2 16.382V5.618a2 2 0 0 1 2.894-1.789L9 5.882l5.553-2.776ZM8 7.618l-4-2v10.764l4 2V7.618Zm2 10.764 4-2V5.618l-4 2v10.764Zm6-12.764v10.764l4 2V7.618l-4-2Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
