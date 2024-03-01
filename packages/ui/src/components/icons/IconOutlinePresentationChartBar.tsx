import { IconProps } from './types'

export const IconOutlinePresentationChartBar = ({
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
				d="M2 4a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2v11a2 2 0 0 1-2 2h-4.586l2.293 2.293a1 1 0 0 1-1.414 1.414L12 18.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L9.586 18H5a2 2 0 0 1-2-2V5a1 1 0 0 1-1-1Zm3 1v11h14V5H5Zm11 2a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm-4 2a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Zm-4 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
