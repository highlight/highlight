import { IconProps } from './types'

export const IconOutlineKey = ({ size = '1em', ...props }: IconProps) => {
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
				d="M15 4a5 5 0 0 0-4.786 6.453 1 1 0 0 1-.25.997L4 17.414V20h2v-1a1 1 0 0 1 1-1h1v-1a1 1 0 0 1 1-1h1.586l1.964-1.964a1 1 0 0 1 .997-.25A5 5 0 1 0 15 4ZM8 20v1a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2v-2.586A2 2 0 0 1 2.586 16l5.562-5.562a7 7 0 1 1 5.414 5.414l-1.855 1.855A1 1 0 0 1 11 18h-1v1a1 1 0 0 1-1 1H8Zm6-13a1 1 0 0 1 1-1 3 3 0 0 1 3 3 1 1 0 1 1-2 0 1 1 0 0 0-1-1 1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
