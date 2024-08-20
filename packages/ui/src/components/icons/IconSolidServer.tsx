import { IconProps } from './types'

export const IconSolidServer = ({ size = '1em', ...props }: IconProps) => {
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
				d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5Zm14 1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM2 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2Zm14 1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
