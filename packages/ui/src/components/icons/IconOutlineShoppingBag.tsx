import { IconProps } from './types'

export const IconOutlineShoppingBag = ({
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
				d="M7 7a5 5 0 0 1 10 0v1h2a1 1 0 0 1 .997.917l1 12A1 1 0 0 1 20 22H4a1 1 0 0 1-.997-1.083l1-12A1 1 0 0 1 5 8h2V7Zm0 3v1a1 1 0 1 0 2 0v-1h6v1a1 1 0 1 0 2 0v-1h1.08l.833 10H5.087l.833-10H7Zm8-2H9V7a3 3 0 1 1 6 0v1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
