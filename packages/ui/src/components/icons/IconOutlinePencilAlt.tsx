import { IconProps } from './types'

export const IconOutlinePencilAlt = ({ size = '1em', ...props }: IconProps) => {
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
				d="M19.707 4.293a1 1 0 0 0-1.414 0L10 12.586V14h1.414l8.293-8.293a1 1 0 0 0 0-1.414ZM16.88 2.879a3 3 0 1 1 4.24 4.241l-8.585 8.586a1 1 0 0 1-.708.293H9a1 1 0 0 1-1-1v-2.828a1 1 0 0 1 .293-.708l8.586-8.585ZM6 6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-5a1 1 0 1 1 2 0v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h5a1 1 0 1 1 0 2H6Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
