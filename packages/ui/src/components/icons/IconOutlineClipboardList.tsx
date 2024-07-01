import { IconProps } from './types'

export const IconOutlineClipboardList = ({
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
				d="M8.17 4A3.001 3.001 0 0 1 11 2h2c1.306 0 2.418.835 2.83 2H17a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1.17Zm0 2H7a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1.17A3.001 3.001 0 0 1 13 8h-2a3.001 3.001 0 0 1-2.83-2ZM11 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Zm-3 8a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm3 0a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-3 4a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm3 0a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
