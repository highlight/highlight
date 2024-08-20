import { IconProps } from './types'

export const IconOutlineArrowNarrowUp = ({
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
				d="M11.293 2.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L13 5.414V21a1 1 0 1 1-2 0V5.414L8.707 7.707a1 1 0 0 1-1.414-1.414l4-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
