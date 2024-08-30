import { IconProps } from './types'

export const IconSolidHand = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9 3a1 1 0 0 1 2 0v5.5a.5.5 0 0 0 1 0V4a1 1 0 1 1 2 0v4.5a.5.5 0 0 0 1 0V6a1 1 0 1 1 2 0v5a7 7 0 1 1-14 0V9a1 1 0 0 1 2 0v2.5a.5.5 0 0 0 1 0V4a1 1 0 0 1 2 0v4.5a.5.5 0 0 0 1 0V3Z"
			/>
		</svg>
	)
}
