import { IconProps } from './types'

export const IconOutlineFlag = ({ size = '1em', ...props }: IconProps) => {
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
				d="M5 4a1 1 0 0 0-1 1v9.17c.313-.11.65-.17 1-.17h6.5a1 1 0 0 1 .707.293l.707.707h6.468l-2.276-4.553a1 1 0 0 1 0-.894L19.382 5H13v4a1 1 0 1 1-2 0V4H5Zm7.914-1H21a1 1 0 0 1 .894 1.447L19.118 10l2.776 5.553A1 1 0 0 1 21 17h-8.5a1 1 0 0 1-.707-.293L11.086 16H5a1 1 0 0 0-1 1v4a1 1 0 1 1-2 0V5a3 3 0 0 1 3-3h6.5a1 1 0 0 1 .707.293l.5.5.207.207Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
