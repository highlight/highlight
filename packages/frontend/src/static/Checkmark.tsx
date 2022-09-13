import * as React from 'react'

function SvgCheckmark(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 64 64"
			width="1em"
			height="1em"
			{...props}
		>
			<path d="M17.6 56.4c-.6 0-1.3-.2-1.8-.7L.7 40.6c-1-1-1-2.6 0-3.5 1-1 2.6-1 3.5 0l13.4 13.4L59.7 8.3c1-1 2.6-1 3.5 0 1 1 1 2.6 0 3.5L19.4 55.7c-.5.5-1.1.7-1.8.7z" />
		</svg>
	)
}

export default SvgCheckmark
