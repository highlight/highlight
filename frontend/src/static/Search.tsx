import * as React from 'react'

function SvgSearch(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 11 11"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clipPath="url(#search_svg__clip0)">
				<path
					d="M10.81 9.71L7.89 7.34c1.237-1.702 1.048-4.074-.465-5.586A4.277 4.277 0 004.348.463 4.29 4.29 0 001.29 1.737 4.347 4.347 0 000 4.812C0 5.964.464 7.064 1.29 7.89a4.31 4.31 0 003.076 1.289c1.048 0 2.114-.361 2.939-1.152l2.973 2.424c.086.086.19.086.275.086a.407.407 0 00.361-.19c.138-.171.138-.446-.103-.635zM4.349 8.25a3.38 3.38 0 01-2.423-1.014A3.45 3.45 0 01.911 4.812c0-.91.36-1.787 1.014-2.423.653-.636 1.512-1.014 2.423-1.014s1.788.36 2.424 1.014c.636.653 1.014 1.512 1.014 2.423S7.425 6.6 6.772 7.236A3.35 3.35 0 014.348 8.25z"
					fill="#000"
				/>
			</g>
			<defs>
				<clipPath id="search_svg__clip0">
					<path fill="#fff" d="M0 0h11v11H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default SvgSearch
