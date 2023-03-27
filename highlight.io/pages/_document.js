// pages/_document.js

import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

class HighlightDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://JGT9LI80J2-dsn.algolia.net" crossorigin />
          <link rel="preconnect" href="https://fonts.googleapis.com"></link>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin></link>
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
          <Script src="https://www.googletagmanager.com/gtag/js?id=AW-10833687189" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
                        function gtag() {
                            (window.dataLayer || []).push(arguments);
                        }

                        gtag('set', 'linker', {
                            'domains': ['app.highlight.io']
                        });
                        gtag('js', new Date());
                        gtag('config', 'AW-10833687189');
                        window.gtag = gtag
                    `}
          </Script>
          <Script
            type="text/javascript"
            id="hs-script-loader"
            async
            defer
            src="//js.hs-scripts.com/20473940.js"
          ></Script>
          <NextScript />
        </Head>
        <body style={{ overflowX: 'hidden' }}>
          <Main />
        </body>
      </Html>
    )
  }
}

export default HighlightDocument
