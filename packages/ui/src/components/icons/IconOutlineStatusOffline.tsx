import React from 'react'

import { IconProps } from './types'

export const IconOutlineStatusOffline = ({
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
				d="M2.293 2.293a1 1 0 0 1 1.414 0l7.775 7.775a2.002 2.002 0 0 1 2.45 2.45l1.514 1.514a4.001 4.001 0 0 0-.618-4.86 1 1 0 0 1 1.415-1.415 6.002 6.002 0 0 1 .648 7.72l1.43 1.429a8.001 8.001 0 0 0-.664-10.563A1 1 0 1 1 19.07 4.93c3.667 3.667 3.89 9.472.672 13.4l1.964 1.964a1 1 0 0 1-1.414 1.414l-18-18a1 1 0 0 1 0-1.414Zm1.495 5.885a1 1 0 0 1 .629 1.267 8 8 0 0 0 1.926 8.212A1 1 0 1 1 4.93 19.07 10 10 0 0 1 2.52 8.807a1 1 0 0 1 1.267-.629Zm3.121 3.539a1 1 0 0 1 1.131.85 3.978 3.978 0 0 0 1.132 2.261 1 1 0 0 1-1.415 1.415 5.978 5.978 0 0 1-1.697-3.396 1 1 0 0 1 .85-1.13Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
