import { IconProps } from './types'

export const IconOutlineTrendingUp = ({
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
				d="M13 8a1 1 0 1 1 0-2h8a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V9.414l-6.293 6.293a1 1 0 0 1-1.414 0L9 12.414l-5.293 5.293a1 1 0 0 1-1.414-1.414l6-6a1 1 0 0 1 1.414 0L13 13.586 18.586 8H13Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
