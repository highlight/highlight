import { IconProps } from './types'

export const IconSolidMinusCircle = ({ size = '1em', ...props }: IconProps) => {
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
				d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7 9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
