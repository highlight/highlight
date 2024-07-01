import React from 'react'

import { IconProps } from './types'

export const IconOutlineVariable = ({ size = '1em', ...props }: IconProps) => {
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
				d="M18.555 3.104a1 1 0 0 1 1.34.451A18.926 18.926 0 0 1 21.872 12c0 3.031-.71 5.9-1.975 8.445a1 1 0 0 1-1.791-.89A16.926 16.926 0 0 0 19.87 12c0-2.716-.636-5.28-1.766-7.555a1 1 0 0 1 .45-1.34Zm-13.239 0a1 1 0 0 1 .45 1.341A16.926 16.926 0 0 0 4 12c0 2.716.636 5.28 1.767 7.555a1 1 0 1 1-1.791.89A18.926 18.926 0 0 1 2 12c0-3.032.71-5.9 1.976-8.445a1 1 0 0 1 1.34-.45ZM8 9a1 1 0 0 1 1-1h1.246a2 2 0 0 1 1.923 1.45l.282.988 1.191-1.39A3 3 0 0 1 15.92 8H16a1 1 0 1 1 0 2h-.08a1 1 0 0 0-.76.35l-2.05 2.392.644 2.258H15a1 1 0 1 1 0 2h-1.246a2 2 0 0 1-1.923-1.45l-.282-.988-1.191 1.39A3 3 0 0 1 8.08 17H8a1 1 0 1 1 0-2h.08a1 1 0 0 0 .76-.35l2.05-2.392L10.247 10H9a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
