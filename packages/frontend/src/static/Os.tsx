import * as React from 'react'

function SvgOs(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 16 16"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clipPath="url(#os_svg__clip0)" fill="current">
				<path d="M15.125 5.326h-1.8v-3.65c0-.525-.475-1-1-1H2.3c-.525 0-.925.4-.925 1v5.25c-.2.125-.275.325-.325.6l-1 4.65c-.075.275 0 .6.2.8.2.2.475.325.8.325h8.325v1.125c0 .475.4.875.875.875h4.925c.475 0 .875-.4.875-.875v-8.25c-.05-.45-.45-.85-.925-.85zM1.425 12l.8-4H9.35v4H1.425zM9.35 6.2v.475H2.675V2H12v3.325h-1.8c-.45 0-.85.4-.85.875zm5.325 7.8h-4V6.676h4V14z" />
				<path d="M12.675 13.327a.675.675 0 100-1.35.675.675 0 000 1.35zM12.35 8.002H13c.2 0 .325-.125.325-.325S13.2 7.352 13 7.352h-.675c-.2 0-.325.125-.325.325s.15.325.35.325z" />
			</g>
			<defs>
				<clipPath id="os_svg__clip0">
					<path fill="#fff" d="M0 0h16v16H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default SvgOs
