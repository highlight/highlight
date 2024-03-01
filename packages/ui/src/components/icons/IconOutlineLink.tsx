import { IconProps } from './types'

export const IconOutlineLink = ({ size = '1em', ...props }: IconProps) => {
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
				d="M19.121 4.879a3 3 0 0 0-4.242 0l-1.1 1.1a1 1 0 1 1-1.414-1.415l1.1-1.1a5 5 0 1 1 7.07 7.072l-4 4a5 5 0 0 1-7.07 0 1 1 0 1 1 1.414-1.415 3 3 0 0 0 4.242 0l4-4a3 3 0 0 0 0-4.242Zm-6 6a3 3 0 0 0-4.242 0l-4 4A3 3 0 1 0 9.12 19.12l1.102-1.101a1 1 0 1 1 1.414 1.414l-1.101 1.101a5 5 0 1 1-7.072-7.07l4-4a5 5 0 0 1 7.072 0 1 1 0 1 1-1.415 1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
