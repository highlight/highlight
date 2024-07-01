import { IconProps } from './types'

export const IconOutlineVideoCamera = ({
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
				d="M2 8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v.382l3.106-1.553A2 2 0 0 1 22 8.618v6.764a2 2 0 0 1-2.894 1.789L16 15.618V16a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8Zm12 5.978a.97.97 0 0 0 0 .042V16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5.978Zm2-.596 4 2V8.618l-4 2v2.764Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
