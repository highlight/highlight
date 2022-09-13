import * as React from 'react'

function SvgCrossCircle(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 64 64"
			width="1em"
			height="1em"
			{...props}
		>
			<path d="M32 0C14.4 0 0 14.4 0 32s14.4 32 32 32 32-14.4 32-32S49.6 0 32 0zm0 58.7c-14.7 0-26.7-12-26.7-26.7S17.3 5.3 32 5.3s26.7 12 26.7 26.7-12 26.7-26.7 26.7z" />
			<path d="M41.9 22.1c-1.1-1.1-2.7-1.1-3.7 0L32 28.3l-6.1-6.1c-1.1-1.1-2.7-1.1-3.7 0-1.1 1.1-1.1 2.7 0 3.7l6.1 6.1-6.1 6.1c-1.1 1.1-1.1 2.7 0 3.7.5.5 1.3.8 1.9.8s1.3-.3 1.9-.8l6.1-6.1 6.1 6.1c.5.5 1.3.8 1.9.8s1.3-.3 1.9-.8c1.1-1.1 1.1-2.7 0-3.7L35.7 32l6.1-6.1c1.1-1.1 1.1-2.7.1-3.8z" />
		</svg>
	)
}

export default SvgCrossCircle
