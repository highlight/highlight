import { IconProps } from './types'

export const IconSolidSegment = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9.27 2.164c.47-.219.99-.219 1.46 0l6.885 3.203c.513.239.513 1.108 0 1.347L10.73 9.917c-.47.218-.99.218-1.46 0L2.385 6.714c-.513-.24-.513-1.108 0-1.347L9.27 2.164Z"
			/>
			<path
				fill="currentColor"
				d="m3.527 8.87-1.142.53c-.513.24-.513 1.108 0 1.348L9.27 13.95c.47.219.99.219 1.46 0l6.885-3.202c.513-.24.513-1.109 0-1.348l-1.142-.53-5.743 2.671c-.47.218-.99.218-1.46 0L3.527 8.87Z"
			/>
			<path
				fill="currentColor"
				d="m2.385 13.286 1.142-.53 5.743 2.671c.47.219.99.219 1.46 0l5.743-2.672 1.142.531c.513.24.513 1.109 0 1.347l-6.885 3.203c-.47.219-.99.219-1.46 0l-6.885-3.203c-.513-.238-.513-1.108 0-1.347Z"
			/>
		</svg>
	)
}
