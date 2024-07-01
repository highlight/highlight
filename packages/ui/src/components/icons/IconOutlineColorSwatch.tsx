import { IconProps } from './types'

export const IconOutlineColorSwatch = ({
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
				d="M2 5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 2.93 3 3 0 0 1 4.192.05l2.829 2.828A3 3 0 0 1 19.069 12 3 3 0 0 1 22 15v4a3 3 0 0 1-3 3H7a5 5 0 0 1-5-5V5Zm9.071 15H19a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1.929l-6 6Zm4.878-7.707h.001l1.657-1.657a1 1 0 0 0 0-1.414l-2.829-2.829a1 1 0 0 0-1.414 0L12 7.757v8.486l3.95-3.95ZM9.123 19.12A2.99 2.99 0 0 0 10 17V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a3 3 0 0 0 5.123 2.12ZM6 17a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
