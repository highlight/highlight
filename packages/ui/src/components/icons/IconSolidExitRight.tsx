import React from 'react'
import { IconProps } from './types'

export const IconSolidExitRight = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 14 14"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				d="M2.1 2.1a.7.7 0 0 0-.7.7v8.4a.7.7 0 1 0 1.4 0V2.8a.7.7 0 0 0-.7-.7Zm7.205 6.505a.7.7 0 1 0 .99.99l2.1-2.1a.7.7 0 0 0 0-.99l-2.1-2.1a.7.7 0 0 0-.99.99l.905.905H4.9a.7.7 0 1 0 0 1.4h5.31l-.905.905Z"
			/>
		</svg>
	)
}
