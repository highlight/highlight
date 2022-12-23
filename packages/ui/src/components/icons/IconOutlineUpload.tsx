import React from 'react'
import { IconProps } from './types'

export const IconOutlineUpload = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 1 1 2 0v1a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-1a1 1 0 1 1 2 0v1Zm2.293-8.293a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L13 6.414V16a1 1 0 1 1-2 0V6.414L8.707 8.707a1 1 0 0 1-1.414 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
