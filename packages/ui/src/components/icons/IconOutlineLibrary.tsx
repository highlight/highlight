import { IconProps } from './types'

export const IconOutlineLibrary = ({ size = '1em', ...props }: IconProps) => {
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
				d="M11.594 2.086a1 1 0 0 1 .812 0l9 4a1 1 0 0 1-.812 1.828L12 4.094l-8.594 3.82a1 1 0 1 1-.812-1.828l9-4ZM2 10a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2v9a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2v-9a1 1 0 0 1-1-1Zm3 1v9h14v-9H5Zm3 2a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
