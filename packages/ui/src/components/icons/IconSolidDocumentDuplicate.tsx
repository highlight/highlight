import React from 'react'

import { IconProps } from './types'

export const IconSolidDocumentDuplicate = ({
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
				d="M9 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6.414A2 2 0 0 0 16.414 5L14 2.586A2 2 0 0 0 12.586 2H9Z"
			/>
			<path
				fill="currentColor"
				d="M3 8a2 2 0 0 1 2-2v7a3 3 0 0 0 3 3h5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"
			/>
		</svg>
	)
}
