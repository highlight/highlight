import { IconProps } from './types'

export const IconOutlineBookOpen = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4 6.82v10.806A9.823 9.823 0 0 1 7.5 17c1.252 0 2.446.222 3.5.626V6.819C10.06 6.317 8.848 6 7.5 6c-1.348 0-2.56.317-3.5.82Zm9 0v10.806A9.823 9.823 0 0 1 16.5 17c1.252 0 2.446.222 3.5.626V6.819C19.06 6.317 17.848 6 16.5 6c-1.348 0-2.56.317-3.5.82Zm-1-1.734C10.733 4.395 9.168 4 7.5 4c-1.92 0-3.703.523-5.053 1.42A1 1 0 0 0 2 6.253v13a1 1 0 0 0 1.553.833C4.54 19.43 5.927 19 7.5 19s2.961.431 3.947 1.086a1 1 0 0 0 1.106 0C13.54 19.43 14.927 19 16.5 19s2.961.431 3.947 1.086A1 1 0 0 0 22 19.253v-13a1 1 0 0 0-.447-.833C20.203 4.523 18.42 4 16.5 4c-1.668 0-3.233.395-4.5 1.086Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
