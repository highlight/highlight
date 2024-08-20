import { IconProps } from './types'

export const IconOutlineSunburstChart = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M11.01 4.061a8.001 8.001 0 0 0-6.79 9.813l2.992-1.141a4.874 4.874 0 0 1 3.803-5.463l-.004-3.209Zm-3.112 10.55-2.97 1.133A7.999 7.999 0 0 0 12 20a7.999 7.999 0 0 0 7.067-4.248l-2.907-1.123a4.869 4.869 0 0 1-4.125 2.28 4.87 4.87 0 0 1-4.137-2.297ZM20 12.002c0 .647-.077 1.278-.222 1.881l-2.922-1.128a4.874 4.874 0 0 0-3.84-5.491l-.004-3.2A8.001 8.001 0 0 1 19.999 12ZM2 12C2 6.476 6.477 2 12 2c5.522 0 10 4.476 10 10 0 5.522-4.479 10-10 10-5.523 0-10-4.477-10-10Zm10.035-2.837a2.872 2.872 0 1 0 0 5.744 2.872 2.872 0 0 0 0-5.744Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
