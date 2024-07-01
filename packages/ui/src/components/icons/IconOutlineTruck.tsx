import React from 'react'

import { IconProps } from './types'

export const IconOutlineTruck = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2h2.586A2 2 0 0 1 18 6.586l-.707.707.707-.707L21.414 10A2 2 0 0 1 22 11.414V16a2 2 0 0 1-2 2h-.17a3.001 3.001 0 0 1-5.66 0H14a1.99 1.99 0 0 1-1-.268A1.99 1.99 0 0 1 12 18H9.83a3.001 3.001 0 0 1-5.66 0H4a2 2 0 0 1-2-2V6Zm2.17 10a3.001 3.001 0 0 1 5.66 0H12V7.997 8m0-.003V6H4v10h.17M14 16h.17a3.001 3.001 0 0 1 5.66 0H20v-4.586L16.586 8H14v8Zm-7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
