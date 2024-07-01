import React from 'react'

import { IconProps } from './types'

export const IconOutlineEmojiHappy = ({
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm6-2a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H9a1 1 0 0 1-1-1Zm6 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H15a1 1 0 0 1-1-1Zm-5.536 4.121a1 1 0 0 1 1.415 0 3 3 0 0 0 4.242 0 1 1 0 0 1 1.415 1.415 5 5 0 0 1-7.072 0 1 1 0 0 1 0-1.415Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
