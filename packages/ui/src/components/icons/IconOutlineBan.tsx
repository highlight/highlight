import { IconProps } from './types'

export const IconOutlineBan = ({ size = '1em', ...props }: IconProps) => {
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
				d="M7.094 5.68 18.32 16.906A8.001 8.001 0 0 0 7.094 5.68Zm9.812 12.64L5.68 7.094A8.002 8.002 0 0 0 16.906 18.32ZM4.929 4.93c3.905-3.905 10.237-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142-3.905 3.905-10.237 3.905-14.142 0-3.905-3.905-3.905-10.237 0-14.142Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
