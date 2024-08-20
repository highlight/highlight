import { IconProps } from './types'

export const IconOutlineShieldExclamation = ({
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
				d="M11.333 2.2a1 1 0 0 1 1.334 0 10.955 10.955 0 0 0 7.9 2.786 1 1 0 0 1 1.019.748C21.856 6.778 22 7.874 22 9c0 6.059-4.144 11.147-9.75 12.59a1 1 0 0 1-.5 0C6.145 20.147 2 15.06 2 9c0-1.127.144-2.222.414-3.266a1 1 0 0 1 1.019-.748 10.955 10.955 0 0 0 7.9-2.786ZM4.181 6.998A11.092 11.092 0 0 0 4 9c0 5.034 3.382 9.28 8 10.586 4.618-1.305 8-5.552 8-10.586 0-.684-.062-1.353-.181-2.001a12.946 12.946 0 0 1-7.82-2.751 12.946 12.946 0 0 1-7.818 2.75ZM12 8a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm-1 7a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
