import React from 'react'
import { IconProps } from './types'

export const IconSolidDuplicate = (props: IconProps) => {
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
				d="M7 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9Z"
			/>
			<path
				fill="currentColor"
				d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2V8a3 3 0 0 1 3-3h5a2 2 0 0 0-2-2H5Z"
			/>
		</svg>
	)
}
