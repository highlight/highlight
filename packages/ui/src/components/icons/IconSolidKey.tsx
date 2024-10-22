import { IconProps } from './types'

export const IconSolidKey = ({ size = '1em', ...props }: IconProps) => {
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
				d="M18 8a6 6 0 0 1-7.743 5.743L8 16H6v2H2v-4l4.257-4.257A6 6 0 1 1 18 8Zm-6-4a1 1 0 1 0 0 2 2 2 0 0 1 2 2 1 1 0 1 0 2 0 4 4 0 0 0-4-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
