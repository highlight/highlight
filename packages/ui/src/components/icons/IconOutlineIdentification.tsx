import { IconProps } from './types'

export const IconOutlineIdentification = ({
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
				d="M9 5a3 3 0 1 1 6 0h4a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h4Zm.17 2H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-4.17a3.001 3.001 0 0 1-5.66 0ZM12 4a1 1 0 0 0-1 1v1a1 1 0 1 0 2 0V5a1 1 0 0 0-1-1Zm-3 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.4 2.8a3 3 0 1 0-4.8 0 4.01 4.01 0 0 0-1.372 1.867 1 1 0 1 0 1.885.666 2.001 2.001 0 0 1 3.773 0 1 1 0 1 0 1.886-.666A4.01 4.01 0 0 0 11.4 13.8ZM14 11a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
