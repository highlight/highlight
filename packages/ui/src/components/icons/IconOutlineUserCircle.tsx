import React from 'react'

import { IconProps } from './types'

export const IconOutlineUserCircle = ({
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
				d="M12 4a8 8 0 0 0-6.598 12.526A14.943 14.943 0 0 1 12 15c2.366 0 4.606.548 6.598 1.526A8 8 0 0 0 12 4Zm7.654 14.436A9.96 9.96 0 0 0 22 12c0-5.523-4.477-10-10-10S2 6.477 2 12a9.96 9.96 0 0 0 2.37 6.464A9.978 9.978 0 0 0 12 22a9.978 9.978 0 0 0 7.654-3.564ZM17.2 18.08A12.954 12.954 0 0 0 12 17c-1.85 0-3.607.386-5.199 1.08A7.968 7.968 0 0 0 12 20c1.985 0 3.8-.723 5.199-1.92ZM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
