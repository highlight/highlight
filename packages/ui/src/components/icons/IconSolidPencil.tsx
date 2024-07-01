import React from 'react'

import { IconProps } from './types'

export const IconSolidPencil = ({ size = '1em', ...props }: IconProps) => {
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
				d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793Zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828Z"
			/>
		</svg>
	)
}
