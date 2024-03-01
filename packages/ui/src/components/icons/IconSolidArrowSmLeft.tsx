import { IconProps } from './types'

export const IconSolidArrowSmLeft = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9.707 14.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L7.414 9H15a1 1 0 1 1 0 2H7.414l2.293 2.293a1 1 0 0 1 0 1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
