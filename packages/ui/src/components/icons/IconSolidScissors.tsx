import { IconProps } from './types'

export const IconSolidScissors = ({ size = '1em', ...props }: IconProps) => {
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
				d="M5.5 2a3.5 3.5 0 1 0 1.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 1 0 1.414 1.414l8.128-8.127a1 1 0 0 0-1.414-1.414L10 8.586l-1.42-1.42A3.5 3.5 0 0 0 5.5 2ZM4 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 9a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M12.828 11.414a1 1 0 0 0-1.414 1.414l3.879 3.88a1 1 0 0 0 1.414-1.415l-3.879-3.879Z"
			/>
		</svg>
	)
}
