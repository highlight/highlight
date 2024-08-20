import { IconProps } from './types'

export const IconSolidCash = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2V9a3 3 0 0 1 3-3h7a2 2 0 0 0-2-2H4Z"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4Zm6 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
