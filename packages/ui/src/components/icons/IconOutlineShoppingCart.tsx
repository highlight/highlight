import { IconProps } from './types'

export const IconOutlineShoppingCart = ({
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
				d="M2 3a1 1 0 0 1 1-1h2a1 1 0 0 1 .98.804L6.22 4H21a1 1 0 0 1 .894 1.447l-4 8A1 1 0 0 1 17 14H7.414l-2 2H17a3 3 0 1 1-2.83 2H9.83a3 3 0 1 1-5.521-.326c-.98-.65-1.268-2.129-.309-3.088l1.914-1.915L4.18 4H3a1 1 0 0 1-1-1Zm5.82 9h8.562l3-6H6.62l1.2 6ZM7 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
