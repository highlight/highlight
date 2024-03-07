import React from 'react'

import { IconProps } from './types'

export const IconOutlineThumbDown = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8.736 4a1 1 0 0 0-.894.553l-3.5 7A1 1 0 0 0 5.236 13H12a1 1 0 1 1 0 2h-1v4a1 1 0 0 0 1 1 4.62 4.62 0 0 1 .776-2.466L16 12.697V4.781l-3.004-.751a1 1 0 0 0-.242-.03H8.736ZM18 5v8h1a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1Zm-1.131 10-2.43 3.643c-.286.43-.439.936-.439 1.453A1.905 1.905 0 0 1 12.095 22H12a3 3 0 0 1-3-3v-4H5.236c-2.23 0-3.68-2.347-2.683-4.342l3.5-7A3 3 0 0 1 8.736 2h4.018a3 3 0 0 1 .727.09l3.642.91H19a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-2.131Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
