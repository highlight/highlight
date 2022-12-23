import React from 'react'
import { IconProps } from './types'

export const IconSolidMagnifyingGlass = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
			className="w-6 h-6"
			viewBox="0 0 20 20"
			width="16"
			height="16"
			focusable="false"
			{...props}
		>
			<path
				fillRule="evenodd"
				d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
