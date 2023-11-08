// pages/_document.js

import Document, { Head, Html, Main, NextScript } from 'next/document'

import Script from 'next/script'

class HighlightDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<link
						rel="preconnect"
						href="https://fonts.googleapis.com"
					/>
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossOrigin
					/>
					<link
						href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap"
						rel="stylesheet"
					/>
					<link
						rel="preconnect"
						href="https://JGT9LI80J2-dsn.algolia.net"
						crossOrigin="true"
					/>
					<link
						rel="preconnect"
						href="https://fonts.googleapis.com"
					></link>
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossOrigin="true"
					></link>
					<link
						href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital@0;1&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
						rel="stylesheet"
					></link>
					<Script
						id="hs-script-loader"
						async
						defer
						strategy="afterInteractive"
						src="//js.hs-scripts.com/20473940.js"
					></Script>
					<Script id="google-tag-manager" strategy="afterInteractive">
						{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
						new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
						j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
						'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
						})(window,document,'script','dataLayer','GTM-PT4CCQ4');`}
					</Script>
					<Script
						type="text/javascript"
						id="hs-script-loader"
						async
						defer
						src="//js.hs-scripts.com/20473940.js"
					></Script>
				</Head>
				<body style={{ overflowX: 'hidden' }}>
					<Main />
					<NextScript />
					<noscript
						dangerouslySetInnerHTML={{
							__html: (
								<iframe
									src="https://www.googletagmanager.com/ns.html?id=GTM-PT4CCQ4"
									height="0"
									width="0"
									style="display:none;visibility:hidden"
								></iframe>
							),
						}}
					/>
				</body>
			</Html>
		)
	}
}

export default HighlightDocument
