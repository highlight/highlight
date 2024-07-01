import React from 'react'

import { IconProps } from './types'

export const IconSolidQrCode = ({ size = '1em', ...props }: IconProps) => {
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
				fillRule="evenodd"
				d="M3 4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Zm2 2V5h1v1H5Zm-2 7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Zm2 2v-1h1v1H5Zm8-12a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3Zm1 2v1h1V5h-1Z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M11 4a1 1 0 1 0-2 0v1a1 1 0 0 0 2 0V4Zm-1 3a1 1 0 0 1 1 1v1h2a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm6 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-7 4a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2v2a1 1 0 1 1-2 0v-3Zm-2-2a1 1 0 1 0 0-2H4a1 1 0 1 0 0 2h3Zm10 2a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm-1 4a1 1 0 1 0 0-2h-3a1 1 0 1 0 0 2h3Z"
			/>
		</svg>
	)
}
