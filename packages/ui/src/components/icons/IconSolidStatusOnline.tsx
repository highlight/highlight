import { IconProps } from './types'

export const IconSolidStatusOnline = ({
	size = '1em',
	...props
}: IconProps) => {
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
				fillRule="evenodd"
				d="M5.05 3.636a1 1 0 0 1 0 1.414 7 7 0 0 0 0 9.9 1 1 0 1 1-1.414 1.414 9 9 0 0 1 0-12.728 1 1 0 0 1 1.414 0Zm9.9 0a1 1 0 0 1 1.414 0 9 9 0 0 1 0 12.728 1 1 0 1 1-1.414-1.414 7 7 0 0 0 0-9.9 1 1 0 0 1 0-1.414ZM7.879 6.464a1 1 0 0 1 0 1.414 3 3 0 0 0 0 4.243 1 1 0 1 1-1.414 1.414 5 5 0 0 1 0-7.07 1 1 0 0 1 1.414 0Zm4.242 0a1 1 0 0 1 1.415 0 5 5 0 0 1 0 7.072 1 1 0 0 1-1.415-1.415 3 3 0 0 0 0-4.242 1 1 0 0 1 0-1.415ZM10.001 9a1 1 0 0 1 1 1v.01a1 1 0 1 1-2 0V10a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
