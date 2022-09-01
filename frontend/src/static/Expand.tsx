import * as React from 'react'

function SvgExpand(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 14 14"
			fill="current"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M12.812 0H7.377c-.543 0-.917.374-.917.917s.374.917.917.917h4.518v4.517c0 .543.373.917.917.917.543 0 .917-.374.917-.917V.917c0-.543-.374-.917-.917-.917zM6.351 11.929H1.8V7.378c0-.543-.374-.917-.917-.917S0 6.835 0 7.378v5.434c0 .543.374.917.917.917h5.434c.543 0 .917-.374.917-.917-.034-.543-.374-.883-.917-.883z" />
		</svg>
	)
}

export default SvgExpand
