import { IconProps } from './types'

export const IconOutlineThumbUp = ({ size = '1em', ...props }: IconProps) => {
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
				d="M10 3.905C10 2.853 10.853 2 11.905 2H12a3 3 0 0 1 3 3v4h3.764c2.23 0 3.68 2.347 2.683 4.342l-3.5 7A3 3 0 0 1 15.264 22h-4.018a3 3 0 0 1-.727-.09L6.877 21H5a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h2.131l2.43-3.643c.286-.43.439-.936.439-1.452ZM6 11H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1v-8Zm2 8.22v-7.917l3.224-4.837A4.617 4.617 0 0 0 12 4a1 1 0 0 1 1 1v4h-1a1 1 0 1 0 0 2h6.764a1 1 0 0 1 .894 1.447l-3.5 7a1 1 0 0 1-.894.553h-4.018a.996.996 0 0 1-.242-.03L8 19.22Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
