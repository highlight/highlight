import React from 'react'

import { IconProps } from './types'

export const IconSolidTrendingDown = ({
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
				fillRule="evenodd"
				d="M12 13a1 1 0 1 0 0 2h5a1 1 0 0 0 1-1V9a1 1 0 1 0-2 0v2.586l-4.293-4.293a1 1 0 0 0-1.414 0L8 9.586 3.707 5.293a1 1 0 0 0-1.414 1.414l5 5a1 1 0 0 0 1.414 0L11 9.414 14.586 13H12Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
