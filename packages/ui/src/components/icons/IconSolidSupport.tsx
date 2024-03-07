import React from 'react'

import { IconProps } from './types'

export const IconSolidSupport = ({ size = '1em', ...props }: IconProps) => {
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
				d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 0 0 .078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10Zm-5.165 3.913 1.58 1.58A5.98 5.98 0 0 1 10 16a5.978 5.978 0 0 1-2.516-.552l1.562-1.562a4.007 4.007 0 0 0 1.789.027Zm-4.677-2.796a4.002 4.002 0 0 1-.041-2.08l-.08.079-1.53-1.532A5.98 5.98 0 0 0 4 10c0 .954.223 1.856.619 2.656l1.54-1.539Zm1.088-6.45A5.974 5.974 0 0 1 10 4c.954 0 1.856.223 2.656.619l-1.539 1.54a4.002 4.002 0 0 0-2.346.033L7.246 4.668ZM12 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
