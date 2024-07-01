import React from 'react'

import { IconProps } from './types'

export const IconSolidLoadingProgress = ({
	size = '1em',
	...props
}: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 114 39"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M18 28a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.6a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Zm3.423-10.045A5 5 0 0 0 18 15v5l3.423-3.645ZM74 28a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.6a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Zm2.409-10.781A5 5 0 0 0 74 15v5l-3.853 3.187a5 5 0 1 0 6.262-7.569ZM97 28a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.6a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Zm0-1.4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
				clipRule="evenodd"
			/>
			<rect
				width={113}
				height={38}
				x={0.5}
				y={0.5}
				stroke="currentColor"
				strokeDasharray="10 5"
				rx={4.5}
			/>
		</svg>
	)
}
