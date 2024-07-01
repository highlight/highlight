import React from 'react'

import { IconProps } from './types'

export const IconOutlineFilm = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5Zm4 0H4v2h2V5Zm2 0v6h8V5H8Zm10 0v2h2V5h-2Zm2 4h-2v2h2V9Zm0 4h-2v2h2v-2Zm0 4h-2v2h2v-2Zm-4 2v-6H8v6h8ZM6 19v-2H4v2h2Zm-2-4h2v-2H4v2Zm0-4h2V9H4v2Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
