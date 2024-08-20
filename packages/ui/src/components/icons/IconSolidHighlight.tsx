import { IconProps } from './types'

export const IconSolidHighlight = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 12 12"
			focusable="false"
			{...props}
		>
			<g id="Own color">
				<circle
					id="Ellipse 132"
					cx="5.99999"
					cy="6"
					r="5.6"
					fill="#744ED4"
				/>
				<path
					id="Subtract"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M4.54999 3.55C3.9977 3.55 3.54999 3.99772 3.54999 4.55V7.45C3.54999 8.00229 3.9977 8.45 4.54999 8.45H6.34999L4.59999 3.55H4.54999ZM5.64999 3.55L7.39999 8.45H7.44999C8.00227 8.45 8.44999 8.00229 8.44999 7.45V4.55C8.44999 3.99772 8.00227 3.55 7.44999 3.55H5.64999Z"
					fill="white"
				/>
			</g>
		</svg>
	)
}
