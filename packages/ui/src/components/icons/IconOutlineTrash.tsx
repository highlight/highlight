import { IconProps } from './types'

export const IconOutlineTrash = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h4a1 1 0 1 1 0 2h-.069l-.8 11.214A3 3 0 0 1 16.137 22H7.862a3 3 0 0 1-2.992-2.786L4.069 8H4a1 1 0 0 1 0-2h4V4ZM6.074 8l.79 11.071a1 1 0 0 0 .998.929h8.276a1 1 0 0 0 .997-.929L17.926 8H6.074ZM14 6h-4V4h4v2Zm-4 4a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
