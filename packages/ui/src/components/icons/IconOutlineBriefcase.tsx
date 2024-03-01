import { IconProps } from './types'

export const IconOutlineBriefcase = ({ size = '1em', ...props }: IconProps) => {
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
				d="M7 4a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h2V4ZM5 7a1 1 0 0 0-1 1v4.57A22.95 22.95 0 0 0 12 14c2.815 0 5.51-.505 8-1.43V8a1 1 0 0 0-1-1H5Zm10-2H9V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1Zm5 9.692A24.971 24.971 0 0 1 12 16a24.98 24.98 0 0 1-8-1.308V18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3.308ZM11 12a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
