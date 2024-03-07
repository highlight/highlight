import React from 'react'

import { IconProps } from './types'

export const IconOutlineCake = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8 3a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H9a1 1 0 0 1-1-1Zm3 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Zm3 0a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H15a1 1 0 0 1-1-1ZM9 5a1 1 0 0 1 1 1v1h1V6a1 1 0 1 1 2 0v1h1V6a1 1 0 1 1 2 0v1a3 3 0 0 1 3 3v1a3 3 0 0 1 3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7a3 3 0 0 1 3-3v-1a3 3 0 0 1 3-3V6a1 1 0 0 1 1-1ZM8 9a1 1 0 0 0-1 1v1h10v-1a1 1 0 0 0-1-1H8Zm-3 4a1 1 0 0 0-1 1v.683c.369.104.725.265 1.055.485a1.704 1.704 0 0 0 1.89 0 3.704 3.704 0 0 1 4.11 0 1.704 1.704 0 0 0 1.89 0 3.704 3.704 0 0 1 4.11 0 1.704 1.704 0 0 0 1.89 0c.33-.22.686-.381 1.055-.485V14a1 1 0 0 0-1-1H5Zm15 3.868a3.704 3.704 0 0 1-4.055-.036 1.704 1.704 0 0 0-1.89 0 3.704 3.704 0 0 1-4.11 0 1.704 1.704 0 0 0-1.89 0A3.704 3.704 0 0 1 4 16.868V20h16v-3.132Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
