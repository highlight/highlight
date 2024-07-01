import React from 'react'

import { IconProps } from './types'

export const IconSolidPaperAirplane = ({
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
				d="M17.447 10.894a1 1 0 0 0 0-1.788l-14-7a1 1 0 0 0-1.409 1.169l1.429 5A1 1 0 0 0 4.429 9H9a1 1 0 1 1 0 2H4.429a1 1 0 0 0-.962.725l-1.429 5a1 1 0 0 0 1.41 1.17l14-7Z"
			/>
		</svg>
	)
}
