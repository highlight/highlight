import { IconProps } from './types'

export const IconSolidPresentationChartBar = ({
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
				d="M3 3a1 1 0 0 0 0 2v8a2 2 0 0 0 2 2h2.586l-1.293 1.293a1 1 0 1 0 1.414 1.414L10 15.414l2.293 2.293a1 1 0 0 0 1.414-1.414L12.414 15H15a2 2 0 0 0 2-2V5a1 1 0 1 0 0-2H3Zm11 4a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V7Zm-3 1a1 1 0 1 0-2 0v3a1 1 0 1 0 2 0V8ZM8 9a1 1 0 0 0-2 0v2a1 1 0 1 0 2 0V9Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
