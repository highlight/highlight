import { IconProps } from './types'

export const IconOutlineFastForward = ({
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
				d="M4 8c0-1.648 1.882-2.589 3.2-1.6L12 10V8c0-1.648 1.882-2.589 3.2-1.6l5.333 4a2 2 0 0 1 0 3.2l-5.333 4c-1.318.989-3.2.048-3.2-1.6v-2l-4.8 3.6c-1.318.989-3.2.048-3.2-1.6V8Zm7.333 4L6 8v8l5.333-4Zm8 0L14 8v8l5.333-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
