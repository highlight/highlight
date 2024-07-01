import React from 'react'

import { IconProps } from './types'

export const IconSolidCursorClick = ({ size = '1em', ...props }: IconProps) => {
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
				d="M6.672 1.912a1 1 0 0 0-1.932.517l.259.966a1 1 0 0 0 1.932-.518l-.26-.965ZM2.43 4.74a1 1 0 0 0-.519 1.932l.966.259a1 1 0 0 0 .518-1.932l-.966-.26Zm8.813-.568a1 1 0 0 0-1.415-1.415l-.707.707a1 1 0 1 0 1.415 1.415l.707-.707Zm-7.072 7.071.708-.707A1 1 0 0 0 3.464 9.12l-.707.707a1 1 0 0 0 1.414 1.415Zm3.2-5.171a1 1 0 0 0-1.3 1.3l4 10a1 1 0 0 0 1.824.075l1.379-2.759 3.019 3.02a1 1 0 1 0 1.414-1.415l-3.019-3.019 2.76-1.38a1 1 0 0 0-.077-1.822l-10-4Z"
			/>
		</svg>
	)
}
