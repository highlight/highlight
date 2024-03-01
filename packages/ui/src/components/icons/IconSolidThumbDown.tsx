import { IconProps } from './types'

export const IconSolidThumbDown = ({ size = '1em', ...props }: IconProps) => {
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
				d="M18 9.5a1.5 1.5 0 1 1-3 0v-6a1.5 1.5 0 0 1 3 0v6Zm-4 .167v-5.43a2 2 0 0 0-1.105-1.79l-.05-.025A4 4 0 0 0 11.055 2H5.64a2 2 0 0 0-1.962 1.608l-1.2 6A2 2 0 0 0 4.44 12H8v4a2 2 0 0 0 2 2 1 1 0 0 0 1-1v-.667a4 4 0 0 1 .8-2.4l1.4-1.866a4 4 0 0 0 .8-2.4Z"
			/>
		</svg>
	)
}
