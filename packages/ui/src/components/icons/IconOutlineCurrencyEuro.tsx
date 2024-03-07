import React from 'react'

import { IconProps } from './types'

export const IconOutlineCurrencyEuro = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm10-4c-.304 0-.792.193-1.264.979a4.259 4.259 0 0 0-.264.521H12a1 1 0 1 1 0 2h-1.983a7.321 7.321 0 0 0 0 1H12a1 1 0 1 1 0 2h-1.528c.08.185.167.36.264.521.472.786.96.979 1.264.979.304 0 .792-.193 1.264-.979a1 1 0 0 1 1.715 1.029C14.279 17.216 13.232 18 12 18s-2.279-.784-2.979-1.95c-.285-.475-.507-1-.67-1.55H8a1 1 0 1 1 0-2h.013a9.358 9.358 0 0 1 0-1H8a1 1 0 1 1 0-2h.351c.163-.55.385-1.075.67-1.55C9.721 6.784 10.768 6 12 6s2.279.784 2.979 1.95a1 1 0 1 1-1.715 1.029C12.792 8.193 12.304 8 12 8Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
