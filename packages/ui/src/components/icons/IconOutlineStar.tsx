import React from 'react'

import { IconProps } from './types'

export const IconOutlineStar = ({ size = '1em', ...props }: IconProps) => {
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
				d="M10.098 2.618c.599-1.843 3.205-1.843 3.804 0l1.519 4.673h4.914c1.938 0 2.743 2.48 1.176 3.619l-3.976 2.889 1.519 4.674c.598 1.842-1.51 3.374-3.078 2.236L12 17.82l-3.976 2.889c-1.567 1.138-3.676-.394-3.078-2.236l1.519-4.674-3.976-2.89C.922 9.772 1.727 7.293 3.665 7.293h4.914l1.519-4.674ZM12 3.236 10.481 7.91A2 2 0 0 1 8.58 9.29H3.665l3.975 2.89a2 2 0 0 1 .727 2.235L6.848 19.09l3.977-2.888a2 2 0 0 1 2.35 0l3.976 2.888-1.518-4.674a2 2 0 0 1 .727-2.236l3.975-2.888h-4.914a2 2 0 0 1-1.902-1.382L12 3.236Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
