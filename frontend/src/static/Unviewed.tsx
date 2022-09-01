import * as React from 'react'

function SvgUnviewed(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 64 64"
			width="1em"
			height="1em"
			{...props}
		>
			<path d="M31.9 24c-4.5 0-8 3.5-8 8s3.5 8 8 8 8-3.5 8-8-3.5-8-8-8zm0 10.7c-1.6 0-2.7-1.1-2.7-2.7s1.1-2.7 2.7-2.7 2.7 1.1 2.7 2.7-1.1 2.7-2.7 2.7z" />
			<path d="M63.4 30.4c-6.9-10.7-18.7-17.1-31.5-17.1S7.4 19.7.4 30.4c-.5 1.1-.5 2.4 0 3.2 6.9 10.7 18.7 17.1 31.5 17.1s24.5-6.4 31.5-17.1c.8-1.1.8-2.1 0-3.2zM31.9 45.6c-10.7 0-20.3-5.1-26.1-13.6 5.9-8.5 15.7-13.6 26.1-13.6 10.7 0 20.3 5.1 26.1 13.6-5.8 8.5-15.4 13.6-26.1 13.6zM5 5l54 54" />
		</svg>
	)
}

export default SvgUnviewed
