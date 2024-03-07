import React from 'react'

import { IconProps } from './types'

export const IconOutlineVolumeUp = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9.586 3.586C10.846 2.326 13 3.218 13 5v14c0 1.782-2.154 2.674-3.414 1.414L5.172 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1.172l4.414-4.414ZM11 5 6.293 9.707a1 1 0 0 1-.707.293H4v4h1.586a1 1 0 0 1 .707.293L11 19V5Zm6.657-.071a1 1 0 0 1 1.414 0c3.905 3.905 3.905 10.237 0 14.142a1 1 0 0 1-1.414-1.414 8 8 0 0 0 0-11.314 1 1 0 0 1 0-1.414Zm-2.829 2.828a1 1 0 0 1 1.415 0 6 6 0 0 1 0 8.486 1 1 0 1 1-1.415-1.415 4 4 0 0 0 0-5.656 1 1 0 0 1 0-1.415Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
