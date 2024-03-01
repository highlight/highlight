import { IconProps } from './types'

export const IconOutlineTag = ({ size = '1em', ...props }: IconProps) => {
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
				d="M7 4a3 3 0 0 0-3 3v5c0 .299.13.566.339.75l.023.02 6.996 6.997A.992.992 0 0 0 12 20a.992.992 0 0 0 .642-.233l6.974-6.974a.96.96 0 0 1 .045-.043.996.996 0 0 0 .106-1.392l-6.974-6.974a.965.965 0 0 1-.043-.045A.995.995 0 0 0 12 4H7ZM2 7a5 5 0 0 1 5-5h5c.884 0 1.68.383 2.227.99l6.98 6.98.043.045c.466.529.75 1.225.75 1.985 0 .884-.383 1.68-.99 2.227l-6.98 6.98A2.992 2.992 0 0 1 12 22a2.992 2.992 0 0 1-2.03-.793l-6.98-6.98A2.995 2.995 0 0 1 2 12V7Zm4 0a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
