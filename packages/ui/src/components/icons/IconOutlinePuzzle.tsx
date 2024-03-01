import { IconProps } from './types'

export const IconOutlinePuzzle = ({ size = '1em', ...props }: IconProps) => {
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
				d="M10 4a3 3 0 1 1 6 0v1h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1a1 1 0 1 0 0 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1a1 1 0 1 0-2 0v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H4a3 3 0 1 1 0-6h1V7a2 2 0 0 1 2-2h3V4Zm3-1a1 1 0 0 0-1 1v1a2 2 0 0 1-2 2H7v3a2 2 0 0 1-2 2H4a1 1 0 1 0 0 2h1a2 2 0 0 1 2 2v3h3v-1a3 3 0 1 1 6 0v1h3v-3h-1a3 3 0 1 1 0-6h1V7h-3a2 2 0 0 1-2-2V4a1 1 0 0 0-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
