import React from 'react'
import { IconProps } from './types'

export const IconSolidLogout = (props: IconProps) => {
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
				fillRule="evenodd"
				d="M2.1 2.1a.7.7 0 0 1 .7.7v8.4a.7.7 0 1 1-1.4 0V2.8a.7.7 0 0 1 .7-.7Zm5.395 2.305a.7.7 0 0 1 0 .99L6.59 6.3h5.31a.7.7 0 1 1 0 1.4H6.59l.905.905a.7.7 0 1 1-.99.99l-2.1-2.1a.7.7 0 0 1 0-.99l2.1-2.1a.7.7 0 0 1 .99 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
