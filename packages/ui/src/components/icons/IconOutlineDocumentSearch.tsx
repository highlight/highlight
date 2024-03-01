import { IconProps } from './types'

export const IconOutlineDocumentSearch = ({
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
				d="M7 4a1 1 0 0 0-1 1v11a1 1 0 1 1-2 0V5a3 3 0 0 1 3-3h5.586A2 2 0 0 1 14 2.586L19.414 8A2 2 0 0 1 20 9.414V19a3 3 0 0 1-3 3h-7a1 1 0 1 1 0-2h7a1 1 0 0 0 1-1V9.414L12.586 4H7Zm5 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 1.968 3.446l-4.26 4.261a1 1 0 0 1-1.415-1.414l4.261-4.261A3.984 3.984 0 0 1 8 14Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
