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
					<Script
						id="zoho-pagesense-loader"
						async
						defer
						strategy="afterInteractive"
						src="https://cdn.pagesense.io/js/highlight/5bfbb7acc3624ec09db9d79caef92b07.js"
					></Script>
					<Script
						id="cb-script"
						src="https://tag.clearbitscripts.com/v1/pk_07d68634b41ba01ce3e518b6120f201e/tags.js"
						referrerPolicy="strict-origin-when-cross-origin"
						strategy="afterInteractive"
					></Script>
					<Script id="google-tag-manager" strategy="afterInteractive">
						{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
						new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
						j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
						'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
						})(window,document,'script','dataLayer','GTM-PT4CCQ4');`}
					</Script>
					<Script id="apollo-script" strategy="afterInteractive">
						{`
						function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");
						o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,
						o.onload=function(){window.trackingFunctions.onLoad({appId:"663162d920974504280b684e"})},
						document.head.appendChild(o)}initApollo();
						`}
					</Script>
					<Script id="rb2b-script" strategy="afterInteractive">
						{`!function () {var reb2b = window.reb2b = window.reb2b || [];
    if (reb2b.invoked) return;reb2b.invoked = true;reb2b.methods = ["identify", "collect"];
    reb2b.factory = function (method) {return function () {var args = Array.prototype.slice.call(arguments);
    args.unshift(method);reb2b.push(args);return reb2b;};};
    for (var i = 0; i < reb2b.methods.length; i++) {var key = reb2b.methods[i];reb2b[key] = reb2b.factory(key);}
    reb2b.load = function (key) {var script = document.createElement("script");script.type = "text/javascript";script.async = true;
    script.src = "https://s3-us-west-2.amazonaws.com/b2bjsstore/b/" + key + "/reb2b.js.gz";
    var first = document.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(script, first);};
    reb2b.SNIPPET_VERSION = "1.0.1";reb2b.load("Y4O7Z0HY8PNX");}();
						`}
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
