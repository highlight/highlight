import React from 'react'

import { IconProps } from './types'

export const IconOutlineCollection = ({
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
				d="M6 5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v1.17c1.165.413 2 1.524 2 2.83v1.17c1.165.412 2 1.524 2 2.83v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-6c0-1.306.835-2.418 2-2.83V9c0-1.306.835-2.417 2-2.83V5Zm2 1h8V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1Zm-2 4h12V9a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1Zm-1 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H5Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
