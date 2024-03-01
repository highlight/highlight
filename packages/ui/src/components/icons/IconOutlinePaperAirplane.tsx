import { IconProps } from './types'

export const IconOutlinePaperAirplane = ({
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
				d="M12 2a1 1 0 0 1 .894.553l9 18a1 1 0 0 1-1.11 1.423L12 20.024l-8.783 1.952a1 1 0 0 1-1.111-1.423l9-18A1 1 0 0 1 12 2Zm1 16.198 6.166 1.37L12 5.236 4.834 19.568 11 18.198V11a1 1 0 1 1 2 0v7.198Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
