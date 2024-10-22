import { IconProps } from './types'

export const IconOutlineUserGroup = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM8 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM5 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm17-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-3 1a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-4 4a4.002 4.002 0 0 0-4 4v1h8v-1a4.002 4.002 0 0 0-4-4Zm6 5h3v-1a2 2 0 0 0-3.213-1.59c.139.507.213 1.04.213 1.59v1Zm-1.071-4.422A5.992 5.992 0 0 0 12 12a5.993 5.993 0 0 0-4.929 2.578A4 4 0 0 0 1 18v2a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1v-2a4 4 0 0 0-6.071-3.422ZM6.213 16.41A2 2 0 0 0 3 18v1h3v-1c0-.55.074-1.083.213-1.59Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
