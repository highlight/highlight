---
title: 'Compression: The simple, powerful upgrade for your web stack'
createdAt: 2022-08-02T12:00:00.000Z
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
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FrkSpr5eQFyzHkf41u3Aw&w=3840&q=75
tags: Engineering
metaTitle: 'How-To: Build a Reverse Proxy with Cloudflare Workers'
---

## Background

One of the features we have on [Highlight](https://highlight.run/ "https://highlight.run/") is the ability to [create a comment on a session](https://docs.highlight.run/comments "https://docs.highlight.run/comments"). The cool thing about these comments is they have a spatial property. A comment is created at a specific location on the screen. This allows users to call out things in the session with the comment's location rather than writing something like "the blue button in the top right corner below the red button...".

![cloudflare-1.gif](https://media.graphassets.com/SqRnurR5SbbTJgRUHxZw "cloudflare-1.gif")

While creating a comment, you can also tag your individual team members or Slack channels. When you do this, Highlight will send a preview of your comment's text along with a screenshot of the screen you commented on.

![cloudflare-2.png](https://media.graphassets.com/resize=width:840,height:473/QwDua3p7Q0qM1Q1v9nwf "cloudflare-2.png")

## The Problem

Under the hood, we use [html2canvas](https://html2canvas.hertzen.com/ "https://html2canvas.hertzen.com/") to get the screenshot. I go over more on why in the [Alternative Solutions](https://github.com/JohnPhamous/pham.codes/blob/master/blog/reverse-proxy-with-cloudflare-workers.mdx#alternative-solutions "https://github.com/JohnPhamous/pham.codes/blob/master/blog/reverse-proxy-with-cloudflare-workers.mdx#alternative-solutions") section.

At a high level, `html2canvas` creates an image by recreating the DOM in a `<canvas>`. We then get a base64 representation of the `<canvas>` to use.

If the screen we're creating a screenshot of has external resources like images, `html2canvas` might not be able to load them due to CORS restrictions. When external resources are blocked, the places where the external resources are on the screen are blank in the screenshot.

For Highlight, this problem is pretty common because our customer's sessions are recorded off the Highlight origin. Most of the external resources Highlight tries loads will probably be blocked by the browser due to CORS.

## Reverse Proxy to the Rescue

So our problem is the CORS restrictions. We can use a reverse proxy to get around the problem.

Instead of making a direct request from the Highlight app to the cross-origin resource, we'll make a request to a Highlight proxy which will make the request to the cross-origin resource, then return the response. To the browser, the requested resource is on the same origin so the cross-origin resource is loaded successfully!

![cloudflare-3.png](https://media.graphassets.com/resize=width:840,height:357/zlR61FgsQmaKcnlvig1E "cloudflare-3.png")

To implement the reverse proxy, we chose to go with Cloudflare Workers for the following reasons:

1.  Independent scaling from our main app API
2.  We don't have to worry about infrastructure
3.  Fun opportunity to try the new shiny toy on a non-mission critical code path

## Code
```
// Boilerplate for workers.
addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(request) {
  const { pathname, searchParams } = new URL(request.url);
  // Gets the URL that will be proxied from `url` search parameter.
  const resourceToProxy = searchParams.get("url");

  // Respond to the requesting caller with the response of the proxied resource.
  return fetch(resourceToProxy);
}
```
Now when you call `html2canvas`, you can pass the URL to the proxy server.
```
html2canvas(document.querySelector('#player'), {
    proxy: "https://path_to_proxy.com", // This is the address to your Cloudflare Worker.
}).then((canvas) => {
  // Do stuff with the canvas.
});
```
## Alternative Solutions

### Using `<canvas>`'s `drawImage()` on a `<video>`

For technical reasons, the video you see isn't actually a video. If you inspect the page on Highlight, you won't find a `<video>` tag. Instead, you'll find an `<iframe>`.

At a high level, the video you see is a reconstructed DOM that has changes applied to it as the video plays. Because the video isn't an actual `<video>`, we couldn't go with this approach.

### Using a headless browser with `getDisplayMedia()`

We could spin up a headless browser that takes the screenshot asynchronously. This would be a costlier project in terms of engineering effort and maintenance. In the long term, this will probably be what we end up doing.

There are some performance implications when using `html2canvas` on deep DOM trees. In the ideal world, we offload this work from the client to the server.
