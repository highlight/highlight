import { IconProps } from './types'

export const IconOutlineDocumentAdd = ({
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
				d="M7 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.414L12.586 4H7ZM4 5a3 3 0 0 1 3-3h5.586A2 2 0 0 1 14 2.586L19.414 8A2 2 0 0 1 20 9.414V19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5Zm8 4a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2v-2a1 1 0 0 1 1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
