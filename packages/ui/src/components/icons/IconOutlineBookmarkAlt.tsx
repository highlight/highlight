import { IconProps } from './types'

export const IconOutlineBookmarkAlt = ({
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
				d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm12-1H9v9.382l2.553-1.276a1 1 0 0 1 .894 0L15 14.382V5ZM7 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1v11a1 1 0 0 1-1.447.894L12 15.118l-3.553 1.776A1 1 0 0 1 7 16V5Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
