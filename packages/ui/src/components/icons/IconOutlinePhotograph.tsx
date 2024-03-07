import React from 'react'

import { IconProps } from './types'

export const IconOutlinePhotograph = ({
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
				d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm2 10.414V18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.586l-1.293-1.293a1 1 0 0 0-1.414 0l-.879.879 1.293 1.293a1 1 0 0 1-1.414 1.414l-2-2-2.586-2.586a1 1 0 0 0-1.414 0L5 16.414Zm9-3.828-1.879-1.879a3 3 0 0 0-4.242 0L5 13.586V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5.592a3 3 0 0 0-4.121.115l-.879.879ZM13 8a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
