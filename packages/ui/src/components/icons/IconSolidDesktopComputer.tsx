import { IconProps } from './types'

export const IconSolidDesktopComputer = ({
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
				d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.22l.123.489.804.804A1 1 0 0 1 13 18H7a1 1 0 0 1-.707-1.707l.804-.804L7.22 15H5a2 2 0 0 1-2-2V5Zm5.771 7H5V5h10v7H8.771Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
