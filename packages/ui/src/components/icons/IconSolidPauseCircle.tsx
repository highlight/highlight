import { IconProps } from './types'

export const IconSolidPauseCircle = ({ size = '1em', ...props }: IconProps) => {
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
				d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM7 8a1 1 0 0 1 2 0v4a1 1 0 1 1-2 0V8Zm5-1a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
