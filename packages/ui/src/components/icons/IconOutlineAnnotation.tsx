import { IconProps } from './types'

export const IconOutlineAnnotation = ({
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
				d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-2.586l-3.707 3.707a1 1 0 0 1-1.414 0L7.586 17H5a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3a1 1 0 0 1 .707.293L12 18.586l3.293-3.293A1 1 0 0 1 16 15h3a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5Zm1 3a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
