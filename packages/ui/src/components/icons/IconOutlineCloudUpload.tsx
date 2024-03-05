import React from 'react'

import { IconProps } from './types'

export const IconOutlineCloudUpload = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M11 3a4 4 0 0 0-3.903 4.879 1 1 0 0 1-.757 1.194A3.002 3.002 0 0 0 7 15a1 1 0 1 1 0 2 5 5 0 0 1-1.986-9.59A6 6 0 0 1 16.67 5.037a6 6 0 0 1 .53 11.843 1 1 0 1 1-.398-1.96A4.002 4.002 0 0 0 15.92 7a1 1 0 0 1-1-.8A4.002 4.002 0 0 0 11 3Zm.293 6.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414L13 12.414V22a1 1 0 1 1-2 0v-9.586l-1.293 1.293a1 1 0 0 1-1.414-1.414l3-3Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
