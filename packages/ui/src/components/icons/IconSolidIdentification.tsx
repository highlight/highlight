import { IconProps } from './types'

export const IconSolidIdentification = ({
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
				d="M10 2a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1Z"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M4 4h3a3 3 0 0 0 6 0h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm2.45 4a2.5 2.5 0 1 0-4.9 0h4.9ZM12 9a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3Zm-1 4a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
