import { IconProps } from './types'

export const IconOutlineLocationMarker = ({
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
				d="M16.95 6.05a7 7 0 1 0-9.9 9.9l4.244 4.243a.998.998 0 0 0 1.413 0l4.243-4.243a7 7 0 0 0 0-9.9ZM5.636 4.636a9 9 0 0 1 12.728 12.728l-3.502 3.502-.018.018-.723.723a2.998 2.998 0 0 1-4.241 0l-4.244-4.243a9 9 0 0 1 0-12.728ZM12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
