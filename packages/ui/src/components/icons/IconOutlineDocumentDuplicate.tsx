import { IconProps } from './types'

export const IconOutlineDocumentDuplicate = ({
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
				d="M10 4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.414L14.586 4H10ZM7 5a3 3 0 0 1 3-3h4.586A2 2 0 0 1 16 2.586L20.414 7A2 2 0 0 1 21 8.414V15a3 3 0 0 1-3 3h-1v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h1V5Zm0 3H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-5a3 3 0 0 1-3-3V8Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
