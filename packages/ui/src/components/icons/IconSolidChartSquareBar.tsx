import { IconProps } from './types'

export const IconSolidChartSquareBar = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M5 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm9 4a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V7Zm-3 2a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V9Zm-3 3a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0v-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
