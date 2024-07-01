import React from 'react'

import { IconProps } from './types'

export const IconOutlineViewBoards = ({
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
				d="M2 7a3 3 0 0 1 3-3h2c.768 0 1.47.289 2 .764A2.989 2.989 0 0 1 11 4h2c.768 0 1.47.289 2 .764A2.989 2.989 0 0 1 17 4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2c-.768 0-1.47-.289-2-.764A2.989 2.989 0 0 1 13 20h-2c-.768 0-1.47-.289-2-.764A2.989 2.989 0 0 1 7 20H5a3 3 0 0 1-3-3V7Zm8 10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v10ZM8 7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V7Zm8 0v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
