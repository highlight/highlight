import { IconProps } from './types'

export const IconOutlineChartBar = ({ size = '1em', ...props }: IconProps) => {
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
				d="M14 5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-2c-.768 0-1.47-.289-2-.764A2.989 2.989 0 0 1 13 22h-2c-.768 0-1.47-.289-2-.764A2.989 2.989 0 0 1 7 22H5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h2c.35 0 .687.06 1 .17V9a3 3 0 0 1 3-3h2c.35 0 .687.06 1 .17V5Zm2 14a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v14ZM14 9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9Zm-6 4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
