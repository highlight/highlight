import { IconProps } from './types'

export const IconOutlineGlobe = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4.252 10H5a3 3 0 0 1 3 3v1a1 1 0 0 0 1 1 3 3 0 0 1 3 3v2a8 8 0 0 0 2-.252V18a3 3 0 0 1 3-3h2.419c.375-.926.581-1.94.581-3s-.206-2.074-.581-3H19a1 1 0 0 0-1 1 3 3 0 1 1-6 0 1 1 0 0 0-1-1h-.5a3.5 3.5 0 0 1-3.491-3.252A8.004 8.004 0 0 0 4.252 10Zm3.304-6.96A10 10 0 0 0 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10a9.958 9.958 0 0 0-1.039-4.444v-.001A10 10 0 0 0 12 2a9.959 9.959 0 0 0-4.444 1.04ZM9 4.581V5.5A1.5 1.5 0 0 0 10.5 7h.5a3 3 0 0 1 3 3 1 1 0 1 0 2 0 3 3 0 0 1 2.309-2.92A7.986 7.986 0 0 0 12 4a7.98 7.98 0 0 0-3 .582ZM18.245 17H17a1 1 0 0 0-1 1v.93A8.038 8.038 0 0 0 18.245 17ZM10 19.748C6.55 18.86 4 15.728 4 12h1a1 1 0 0 1 1 1v1a3 3 0 0 0 3 3 1 1 0 0 1 1 1v1.748Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
