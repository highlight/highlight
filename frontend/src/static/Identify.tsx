import * as React from 'react'

function SvgIdentify(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 64 54"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M32.1 32.3c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm0-26.6c-5.9 0-10.7 4.8-10.7 10.7 0 5.9 4.9 10.6 10.7 10.6 5.8 0 10.7-4.8 10.7-10.7 0-5.9-4.8-10.6-10.7-10.6zM2.8 53.701c-.8 0-1.6-.3-2.1-1.1-1.1-1.1-.8-2.9.3-3.7 8.8-7.2 19.7-11.2 31.2-11.2s22.4 4 30.9 11.2c1.1 1.1 1.3 2.7.3 3.7-1.1 1.1-2.7 1.3-3.7.3-7.6-6.4-17.4-9.9-27.6-9.9-10.2 0-20 3.5-27.7 10.1-.3.3-1.1.6-1.6.6z"
				fill="current"
			/>
		</svg>
	)
}

export default SvgIdentify
