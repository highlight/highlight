import { IconProps } from './types'

export const IconSolidTruck = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
			/>
			<path
				fill="currentColor"
				d="M3 4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.05a2.5 2.5 0 0 1 4.9 0H10a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H3Zm11 3a1 1 0 0 0-1 1v6.05A2.5 2.5 0 0 1 15.95 16H17a1 1 0 0 0 1-1v-5a1 1 0 0 0-.293-.707l-2-2A1 1 0 0 0 15 7h-1Z"
			/>
		</svg>
	)
}
