import { IconProps } from './types'

export const IconOutlineOfficeBuilding = ({
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
				d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v15h1a1 1 0 1 1 0 2H3a1 1 0 0 1 0-2h1V5Zm2 15h3v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4h3V5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v15Zm7 0v-4h-2v4h2ZM8 7a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm5 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Zm-5 4a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm5 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
