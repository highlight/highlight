import { IconProps } from './types'

export const IconOutlinePlayCircle = ({
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7-2.131c0-1.598 1.78-2.55 3.11-1.665l3.197 2.132a2 2 0 0 1 0 3.328l-3.198 2.132C10.78 16.682 9 15.729 9 14.132V9.869ZM14.197 12 11 9.869v4.263L14.197 12Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
