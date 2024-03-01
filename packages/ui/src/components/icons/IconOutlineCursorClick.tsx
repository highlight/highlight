import { IconProps } from './types'

export const IconOutlineCursorClick = ({
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
				d="M6.93 1.273a1 1 0 0 1 1.224.707l.777 2.897a1 1 0 0 1-1.932.518l-.777-2.898a1 1 0 0 1 .707-1.224Zm7.727 2.07a1 1 0 0 1 0 1.414L12.535 6.88a1 1 0 1 1-1.414-1.414l2.122-2.122a1 1 0 0 1 1.414 0ZM1.272 6.93a1 1 0 0 1 1.225-.707L5.395 7a1 1 0 0 1-.518 1.932L1.98 8.154a1 1 0 0 1-.708-1.225Zm7.02 1.364a1 1 0 0 1 1.05-.233l11 4a1 1 0 0 1 .03 1.868l-3.593 1.437 3.928 3.928a1 1 0 0 1-1.414 1.414l-3.928-3.928-1.437 3.592a1 1 0 0 1-1.868-.03l-4-11a1 1 0 0 1 .233-1.048Zm2.38 2.38 2.372 6.523 1.027-2.567a1 1 0 0 1 .558-.557l2.567-1.027-6.524-2.373Zm-3.793.448a1 1 0 0 1 0 1.415l-2.122 2.12a1 1 0 0 1-1.414-1.413l2.121-2.122a1 1 0 0 1 1.415 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
