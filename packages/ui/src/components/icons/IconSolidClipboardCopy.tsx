import React from 'react'

import { IconProps } from './types'

export const IconSolidClipboardCopy = ({
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
				d="M8 2a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2H8Z"
			/>
			<path
				fill="currentColor"
				d="M3 5a2 2 0 0 1 2-2 3 3 0 0 0 3 3h2a3 3 0 0 0 3-3 2 2 0 0 1 2 2v6h-4.586l1.293-1.293a1 1 0 0 0-1.414-1.414l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414-1.414L10.414 13H15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm12 6h2a1 1 0 1 1 0 2h-2v-2Z"
			/>
		</svg>
	)
}
