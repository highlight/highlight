import { IconProps } from './types'

export const IconSolidMicrophone = ({ size = '1em', ...props }: IconProps) => {
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
				d="M7 4a3 3 0 0 1 6 0v4a3 3 0 1 1-6 0V4Z"
			/>
			<path
				fill="currentColor"
				d="M11 14.93A7.001 7.001 0 0 0 17 8a1 1 0 1 0-2 0A5 5 0 0 1 5 8a1 1 0 0 0-2 0 7.001 7.001 0 0 0 6 6.93V17H6a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07Z"
			/>
		</svg>
	)
}
