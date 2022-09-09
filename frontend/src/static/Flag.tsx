import * as React from 'react'

function SvgFlag(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 64 64"
			width="1em"
			height="1em"
			{...props}
		>
			<path d="M53.7 9.6C52.6 8.5 51.5 8 50.2 8H14.7V2.7C14.7 1.1 13.6 0 12 0S9.4 1.1 9.4 2.7v58.6c0 1.6 1.1 2.7 2.7 2.7s2.7-1.1 2.7-2.7v-24H47c2.1 0 4-1.6 4.3-3.7l3.2-20.8c.3-1.1 0-2.4-.8-3.2zM46.2 32H14.7V13.3h34.4L46.2 32z" />
		</svg>
	)
}

export default SvgFlag
