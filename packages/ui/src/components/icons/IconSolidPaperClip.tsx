import { IconProps } from './types'

export const IconSolidPaperClip = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8 4a3 3 0 0 0-3 3v4a5 5 0 0 0 10 0V7a1 1 0 1 1 2 0v4a7 7 0 1 1-14 0V7a5 5 0 0 1 10 0v4a3 3 0 1 1-6 0V7a1 1 0 0 1 2 0v4a1 1 0 1 0 2 0V7a3 3 0 0 0-3-3Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
