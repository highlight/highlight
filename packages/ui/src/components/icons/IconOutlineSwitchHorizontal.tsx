import { IconProps } from './types'

export const IconOutlineSwitchHorizontal = ({
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
				d="M20.707 6.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L17.586 8H8a1 1 0 1 1 0-2h9.586l-2.293-2.293a1 1 0 0 1 1.414-1.414l4 4ZM6.414 16H16a1 1 0 1 1 0 2H6.414l2.293 2.293a1 1 0 1 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L6.414 16Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
