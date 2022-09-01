import * as React from 'react'

function SvgPlus(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 18 18"
			fill="current"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M17.184 8.228H9.731V.758c0-.45-.31-.758-.76-.758s-.758.309-.758.758v7.498H.759c-.45-.028-.759.28-.759.73 0 .45.31.758.76.758h7.48v7.498c0 .45.31.758.76.758s.76-.309.76-.758V9.716h7.48c.45 0 .76-.309.76-.758-.056-.421-.366-.73-.816-.73z" />
		</svg>
	)
}

export default SvgPlus
