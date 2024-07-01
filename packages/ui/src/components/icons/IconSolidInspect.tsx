import React from 'react'

import { IconProps } from './types'

export const IconSolidInspect = ({ size = '1em', ...props }: IconProps) => {
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
				d="M15 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.5a1 1 0 1 1 0 2H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v1.5a1 1 0 1 1-2 0V5a1 1 0 0 0-1-1Z"
			/>
			<path
				fill="currentColor"
				d="M7.269 7.269a.913.913 0 0 1 .988-.203l9.167 3.666a.917.917 0 0 1 .07 1.671L14 14l-1.597 3.493a.917.917 0 0 1-1.67-.07L7.065 8.258a.917.917 0 0 1 .203-.988Z"
			/>
		</svg>
	)
}
