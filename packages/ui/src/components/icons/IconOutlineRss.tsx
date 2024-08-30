import { IconProps } from './types'

export const IconOutlineRss = ({ size = '1em', ...props }: IconProps) => {
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
				d="M5 5a1 1 0 0 1 1-1c7.732 0 14 6.268 14 14a1 1 0 1 1-2 0c0-6.627-5.373-12-12-12a1 1 0 0 1-1-1Zm0 6a1 1 0 0 1 1-1 8 8 0 0 1 8 8 1 1 0 1 1-2 0 6 6 0 0 0-6-6 1 1 0 0 1-1-1Zm-1 7a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
