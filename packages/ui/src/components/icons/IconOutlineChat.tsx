import React from 'react'

import { IconProps } from './types'

export const IconOutlineChat = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 5c-4.532 0-8 3.241-8 7 0 1.352.438 2.619 1.209 3.7a1 1 0 0 1 .122.931l-.763 2.036 2.98-.597a1 1 0 0 1 .628.079A8.862 8.862 0 0 0 12 19c4.532 0 8-3.242 8-7 0-3.759-3.468-7-8-7ZM2 12c0-5.078 4.591-9 10-9s10 3.922 10 9c0 5.078-4.591 9-10 9-1.565 0-3.051-.324-4.377-.905l-4.427.886a1 1 0 0 1-1.132-1.332l1.215-3.24A8.283 8.283 0 0 1 2 12Zm5 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm4 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Zm4 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H16a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
