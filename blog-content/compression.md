---
title: 'Compression: The simple, powerful upgrade for your web stack'
createdAt: 2022-08-01T12:00:00.000Z
readingTime: 4
authorFirstName: John
authorLastName: Pham
authorTitle: Ninja 10x Engineer
authorTwitter: 'https://twitter.com/johnphamous'
authorLinkedIn: 'https://www.linkedin.com/in/johnphamous/'
authorGithub: 'https://github.com/JohnPhamous'
authorWebsite: 'https://www.omakasemoney.com/'
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FolnMfFZmQ36zzUSd1wkO&w=3840&q=75
image: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FDFZEbWP4TSCSPvoVG7xL&w=3840&q=75
tags: Engineering
metaTitle: 'Compression: The simple, powerful upgrade for your web stack'
---

At Highlight, we're super focused on keeping our app snappy and fast. Given our product, we take responsibility for making sure that our users are able to quickly find the session/error/trace that identifies an issue as fast as possible.

Recently, we've been experimenting with quite a few methods to speed up larger request payloads on our [GraphQL](https://graphql.org/ "https://graphql.org/") endpoints, and we found that compression has done wonders. Below, I'll share an overview of compression in the modern web stack as well as some code that can get you started!

## What is compression and how can it help me?

Simply put, [compression algorithms](https://www.sciencedirect.com/topics/computer-science/compression-algorithm "https://www.sciencedirect.com/topics/computer-science/compression-algorithm") recognize patterns in data and use these patterns to reduce the payload size sent across the wire. For the purpose of this discussion, we'll focus on text compression, but for the most part, these concepts roll over to other types as well (sound, video, etc..).

In a modern web stack, because text is being sent over HTTP quite frequently (between your frontend and backend servers, for example), we can make use of patterns in this text to dramatically decrease the size of data. If this can be successfully done, your web server won't have to send as much data which saves bandwidth. Beyond that, if the amount of time taken to compress the data is minimal, this can also give your app a performance/speed boost. Overall, because there are loads of libraries and frameworks out there that will do this for us, experimenting with compression in your web app is well worth the effort!

## What are common compression algorithms out there?

From 1992 to 2013 or so, the most common compression algorithm used on the web was [Gzip](https://www.gzip.org/ "https://www.gzip.org/"). Because it was quite fast and decreased size by a lot, it quickly became very ubiquitous, gaining support in all major web browsers and [CDNs](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/ "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/"). Around 2013, Google published a new algorithm called [Brotli](https://brotli.org/ "https://brotli.org/"), which performed even better than Gzip, and has been gaining popularity since. At this point, Brotli is supported by all major browsers and has a clear benefit over Gzip both from a speed and efficiency perspective, and this is what we use at Highlight!

## Brotli at Highlight

As mentioned earlier, Brotli is [supported on most modern browsers](https://caniuse.com/brotli "https://caniuse.com/brotli"). For browsers that don't support Brotli, however, the compression method will fall back to gzip based on the request's \`Accept-Encoding\` header. This means that there's little to no downside to enabling Brotli; it's an easy performance win.

When we enabled Brotli compression for [Highlight](https://highlight.run/ "https://highlight.run/"), we saw response sizes decrease around 40% with no latency increases (requests were faster!). We're now using this on all of our API endpoints and there's a clear difference in load times and bandwidth usage.

## The Code Changes

Because of its ubiquity, most languages/frameworks will likely have a Brotli library that can be wrapped around the web server. At Highlight, we write a lot of Go, so below is an example for implementing Brotli compression in a Chi router.

## Installing Dependencies
```
# Install the Chi, older versions of Chi don't support Brotli
go get -u github.com/go-chi/chi
# Install the package that will do the Brotli compression
go get -u gopkg.in/kothar/brotli-go.v0
```
## Enabling Brotli Compression
```
r := chi.NewMux()
compressor := middleware.NewCompressor(5, "/*")
compressor.SetEncoder("br",func(w io.Writer, level int) io.Writer {
    params := brotli_enc.NewBrotliParams()
    params.SetQuality(level)return brotli_enc.NewBrotliWriter(params, w)})
r.Use(compressor.Handler)
```
The \`"/\*"\` means to compress all content types that can be compressed. These are the supported types:
```
var defaultCompressibleContentTypes = {
        "text/html",
        "text/css",
        "text/plain",
        "text/javascript",
        "application/javascript",
        "application/x-javascript",
        "application/json",
        "application/atom+xml",
        "application/rss+xml",
        "image/svg+xml",
}
```
That's it, congrats on the easy performance win for you and your users!
