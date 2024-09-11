import { IconProps } from './types'

export const IconOutlineSortAscending = ({
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
				d="M2 4a1 1 0 0 1 1-1h13a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h9a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm14 2.414-2.293 2.293a1 1 0 0 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L18 10.414V20a1 1 0 1 1-2 0v-9.586ZM2 12a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
