import { IconProps } from './types'

export const IconSolidInboxIn = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M3 5a2 2 0 0 1 2-2h1a1 1 0 0 1 0 2H5v10h10V5h-1a1 1 0 1 1 0-2h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"
				clipRule="evenodd"
			/>
			<path
				fill="currentColor"
				d="M4 12h3l1 2h4l1-2h3v4H4v-4Zm3.293-4.707a1 1 0 0 1 1.414 0L9 7.586V3a1 1 0 1 1 2 0v4.586l.293-.293a1 1 0 1 1 1.414 1.414l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 0-1.414Z"
			/>
		</svg>
	)
}
