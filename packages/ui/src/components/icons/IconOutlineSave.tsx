import { IconProps } from './types'

export const IconOutlineSave = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 3a1 1 0 0 1 1 1v7.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L11 11.586V4a1 1 0 0 1 1-1ZM2 9a3 3 0 0 1 3-3h3a1 1 0 0 1 0 2H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-3a1 1 0 1 1 0-2h3a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
