import { IconProps } from './types'

export const IconOutlineInbox = ({ size = '1em', ...props }: IconProps) => {
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
				d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v6h1.586A2 2 0 0 1 8 12.586L10.414 15h3.172L16 12.586A2 2 0 0 1 17.414 12H19V6a1 1 0 0 0-1-1H6Zm13 9h-1.586L15 16.414a2 2 0 0 1-1.414.586h-3.172A2 2 0 0 1 9 16.414L6.586 14H5v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
