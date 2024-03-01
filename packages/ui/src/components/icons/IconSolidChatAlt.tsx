import { IconProps } from './types'

export const IconSolidChatAlt = ({ size = '1em', ...props }: IconProps) => {
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
				d="M18 5v8a2 2 0 0 1-2 2h-5l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2ZM7 8H5v2h2V8Zm2 0h2v2H9V8Zm6 0h-2v2h2V8Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
