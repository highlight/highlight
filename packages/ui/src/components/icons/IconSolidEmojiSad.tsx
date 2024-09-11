import { IconProps } from './types'

export const IconSolidEmojiSad = ({ size = '1em', ...props }: IconProps) => {
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
				fillRule="evenodd"
				d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM7 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-7.536 5.879a1 1 0 0 0 1.415 0 3 3 0 0 1 4.242 0 1 1 0 0 0 1.415-1.415 5 5 0 0 0-7.072 0 1 1 0 0 0 0 1.415Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
