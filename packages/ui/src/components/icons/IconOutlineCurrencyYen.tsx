import React from 'react'

import { IconProps } from './types'

export const IconOutlineCurrencyYen = ({
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm6.486-4.857a1 1 0 0 1 1.371.343L11.967 11h.067l2.108-3.514a1 1 0 0 1 1.716 1.029L14.366 11H15a1 1 0 1 1 0 2h-1.834l-.166.277V14h2a1 1 0 1 1 0 2h-2v1a1 1 0 1 1-2 0v-1H9a1 1 0 1 1 0-2h2v-.723L10.834 13H9a1 1 0 1 1 0-2h.634L8.143 8.514a1 1 0 0 1 .342-1.371Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
