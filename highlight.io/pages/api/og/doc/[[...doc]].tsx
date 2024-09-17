import { ImageResponse } from '@vercel/og'
import 'fs'
import Image from 'next/image'
import { NextRequest, URLPattern } from 'next/server'
import { withEdgeRouterHighlight } from '../../../../highlight.edge.config'
import { bug1, bug2, font, fontLight, logoOnDark } from '../util'

export const config = {
	runtime: 'edge',
}

// Used for generating og images for docs pages. Example usage:
// https://highlight.io/api/og/doc/docs/getting-started/introduction/test
const handler = withEdgeRouterHighlight(async function (req: NextRequest) {
	const fontData = await font
	const fontLightData = await fontLight
	const logoData = await logoOnDark
	const logoBase64 = btoa(
		new Uint8Array(logoData).reduce(function (p, c) {
			return p + String.fromCharCode(c)
		}, ''),
	)
	const bug1Data = await bug1
	const bug1Base64 = btoa(
		new Uint8Array(bug1Data).reduce(function (p, c) {
			return p + String.fromCharCode(c)
		}, ''),
	)
	const bug2Data = await bug2
	const bug2Base64 = btoa(
		new Uint8Array(bug2Data).reduce(function (p, c) {
			return p + String.fromCharCode(c)
		}, ''),
	)
	const docPath = new URLPattern({ pathname: '/api/og/doc/:doc*' }).exec(
		req.url,
	)?.pathname.groups.doc

	const readablePaths = docPath?.split('/').map((s) =>
		s
			.substring(s.indexOf('_') + 1)
			.split('-')
			.map((string) =>
				string.length < 3
					? string.toUpperCase()
					: string.charAt(0).toUpperCase() + string.slice(1),
			)
			.join(' '),
	)
	const crumbs = readablePaths?.slice(-3, -1)
	const title = readablePaths?.at(-1)
	console.log('highlight og image for doc', { title, crumbs, docPath })

	return new ImageResponse(
		(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#0D0225',
				}}
			>
				<Image
					alt={'logo'}
					style={{
						marginTop: 40,
						marginBottom: 66,
					}}
					width={180}
					height={180}
					src={`data:image/png;base64,${logoBase64}`}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							marginBottom: 15,
							fontSize: 35,
							fontFamily: 'PoppinsLight',
							color: '#dfdfdf',
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						Docs /{' '}
						{crumbs?.length ? crumbs.join(' / ') : 'General Docs'}
					</div>
					<div
						style={{
							fontSize: 75,
							fontFamily: 'Poppins',
							color: 'white',
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{title || 'Highlight Documentation'}
					</div>
				</div>
				<Image
					alt={'bug1'}
					style={{
						position: 'absolute',
						top: 50,
						left: 80,
					}}
					width={207.98 * 1.1}
					height={255.91 * 1.1}
					src={`data:image/png;base64,${bug1Base64}`}
				/>
				<Image
					alt={'bug2'}
					style={{
						position: 'absolute',
						top: 30,
						left: 830,
					}}
					width={308.49 * 1.2}
					height={235.58 * 1.2}
					src={`data:image/png;base64,${bug2Base64}`}
				/>
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
})
export default handler
