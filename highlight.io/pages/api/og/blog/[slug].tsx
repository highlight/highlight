import { ImageResponse } from '@vercel/og'
import { NextRequest, URLPattern } from 'next/server'
import { backdrop, font, fontLight } from '../util'

export const config = {
	runtime: 'edge',
}

//Example query: https://highlight.io/api/og/blog/highlight-launch-week-day-5?title=Day+5%3A+Our+Partners+%26+Supporters&fname=Vadim&lname=Korolik&role=Co-Founder+%26+CTO
//This query is sent from each blog slug to generate the og image
export default async function handler(req: NextRequest) {
	const query = req.nextUrl.href
	const fontData = await font
	const fontLightData = await fontLight
	const backdropData = await backdrop
	const backDropBase64 = btoa(
		new Uint8Array(backdropData).reduce(function (p, c) {
			return p + String.fromCharCode(c)
		}, ''),
	)

	const slug = new URLPattern({ pathname: '/api/og/blog/:slug' }).exec(
		req.url,
	)?.pathname.groups.slug

	const url = new URL(query)
	const title = url.searchParams.get('title')
	const firstName = url.searchParams.get('fname')
	const lastName = url.searchParams.get('lname')
	const role = url.searchParams.get('role')

	return new ImageResponse(
		(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'flex-start',
					backgroundColor: '#0D0225',
				}}
			>
				<div
					style={{
						display: 'flex',
						color: 'white',
						flexDirection: 'column',
						width: 600,
						height: '100%',
						justifyContent: 'space-between',
						paddingTop: 50,
						paddingLeft: 50,
						paddingBottom: 50,
					}}
				>
					<img
						alt={'backdrop'}
						style={{
							position: 'absolute',
							top: 0,
							left: 550,
						}}
						width={650}
						height={650}
						src={`data:image/png;base64,${backDropBase64}`}
					></img>
					<svg
						width="68"
						height="68"
						viewBox="0 0 68 68"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="34" cy="34" r="34" fill="#6C37F4" />
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M23.375 19.125C21.0278 19.125 19.125 21.0278 19.125 23.375V44.625C19.125 46.9722 21.0278 48.875 23.375 48.875H36.125L25.5 19.125H23.375ZM31.875 19.125L42.5 48.875H44.625C46.9722 48.875 48.875 46.9722 48.875 44.625V23.375C48.875 21.0278 46.9722 19.125 44.625 19.125H31.875Z"
							fill="white"
						/>
					</svg>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<span
							style={{
								color: '#0D0225',
								marginBottom: 20,
								backgroundColor: '#ebff5e',
								padding: '6px 18px 2px 18px',
								borderRadius: 100,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '200px',
							}}
						>
							Highlight Blog
						</span>
						<span
							style={{
								fontSize: 50,
								marginBottom: 60,
								lineHeight: '1.2em',
								maxHeight: '4.2em',
								textOverflow: 'ellipsis',
								overflow: 'hidden',
							}}
						>
							{title || slug}
						</span>
						<div tw={'flex flex-row items-center'}>
							<div tw={'flex flex-col'}>
								<span style={{ fontSize: 24 }}>
									{firstName || ''} {lastName || ''}
								</span>
								<span
									style={{
										color: '#DFDFDF',
										fontSize: 24,
										fontFamily: '"PoppinsLight"',
									}}
								>
									{role || ''}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Poppins',
					data: fontData,
					weight: 600,
					style: 'normal',
				},
				{
					name: 'PoppinsLight',
					data: fontLightData,
					weight: 400,
					style: 'normal',
				},
			],
		},
	)
}
