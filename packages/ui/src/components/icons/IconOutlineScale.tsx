import React from 'react'

import { IconProps } from './types'

export const IconOutlineScale = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 2a1 1 0 0 1 1 1v1.28l5 1.666 2.684-.895a1 1 0 0 1 .632 1.898l-2.051.683 2.668 8.003a1 1 0 0 1-.33 1.164 6.002 6.002 0 0 1-7.204 0 1 1 0 0 1-.348-1.115l2.684-8.052L13 6.387V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2V6.387L7.265 7.632l2.668 8.003a1 1 0 0 1-.33 1.164 6.002 6.002 0 0 1-7.204 0 1 1 0 0 1-.348-1.115l2.684-8.052-2.051-.683a1 1 0 0 1 .632-1.898L6 5.946l5-1.667V3a1 1 0 0 1 1-1Zm-6 8.162-1.803 5.41a4.01 4.01 0 0 0 3.606 0L6 10.162Zm12 0-1.803 5.41a4.01 4.01 0 0 0 3.606 0L18 10.162Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
