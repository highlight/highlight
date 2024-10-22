import { IconProps } from './types'

export const IconOutlineArrowsExpand = ({
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
				d="M3 4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H6.414l3.293 3.293a1 1 0 0 1-1.414 1.414L5 6.414V8a1 1 0 0 1-2 0V4Zm13-1h4a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V6.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L17.586 5H16a1 1 0 1 1 0-2ZM9.707 14.293a1 1 0 0 1 0 1.414L6.414 19H8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v1.586l3.293-3.293a1 1 0 0 1 1.414 0Zm4.586 0a1 1 0 0 1 1.414 0L19 17.586V16a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1h-4a1 1 0 1 1 0-2h1.586l-3.293-3.293a1 1 0 0 1 0-1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
