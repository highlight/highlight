import React from 'react'
import { IconProps } from './types'

export const IconSolidBan = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-4.523 4.89A6 6 0 0 1 5.11 6.524l8.367 8.368Zm1.414-1.414L6.524 5.11a6 6 0 0 1 8.367 8.367Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
