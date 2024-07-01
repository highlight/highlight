import React from 'react'

import { IconProps } from './types'

export const IconSolidStatusOffline = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M3.707 2.293a1 1 0 0 0-1.414 1.414l6.921 6.922c.05.062.105.118.168.167l6.91 6.911a1 1 0 0 0 1.415-1.414l-.675-.675a9.001 9.001 0 0 0-.668-11.982A1 1 0 1 0 14.95 5.05a7.002 7.002 0 0 1 .657 9.143l-1.435-1.435a5.002 5.002 0 0 0-.636-6.294A1 1 0 0 0 12.12 7.88a3 3 0 0 1 .587 3.415l-1.992-1.992a.922.922 0 0 0-.018-.018l-6.99-6.991Zm-.469 5.894a1 1 0 0 0-1.933-.516 9 9 0 0 0 2.331 8.693 1 1 0 0 0 1.414-1.415 6.997 6.997 0 0 1-1.812-6.762ZM7.4 11.5a1 1 0 1 0-1.73 1c.214.371.48.72.795 1.035a1 1 0 0 0 1.414-1.414c-.191-.191-.35-.4-.478-.622Z"
			/>
		</svg>
	)
}
