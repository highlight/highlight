---
title: Privacy
slug: privacy
createdAt: 2021-09-14T17:47:33.000Z
updatedAt: 2022-08-03T23:29:08.000Z
---

## Masking Elements

One way to sanitize your recordings is by adding the `highlight-block` CSS class to elements that should be ignored.

```html
<div class="highlight-block">Super secret sauce</div>
```

The Highlight snippet will in-turn measure the dimensions of the ignored element, and when the recording is being replayed, an empty placeholder will replace the content.

![](/images/redaction.gif.webp)

## Obfuscating Elements

Alternatively, you can obfuscate specific HTML elements by adding the `highlight-mask` CSS class. The effect is the same of setting `privacySetting: 'strict'` (the randomized text in the photo above) but applies to the specific HTML element that you mask.

```html
<div class="highlight-mask">This is some sensitive data <button>Important Button</button></div>
```

## Ignoring Input

```hint
The following CSS class only works for `<input>` elements. If you are interested in blocking the capture of other HTML elements, see the `highlight-block` class
```

For sensitive input fields that your team would like to ignore user input for, you can add a CSS class `highlight-ignore` that will preserve the styling of the input element, but ignore all user input.

```html
<input class="highlight-ignore" name="social security number" />
```

## Network Request Redaction
Interested in redacting particular requests, responses, or the data within them? Highlight will redact certain headers out of the box, but provides a few ways to customize the redaction process to suit your specific needs and preferences. Take a look at our documentation on [Recording Network Requests and Responses](./recording-network-requests-and-responses.md) to learn more.

## Default Privacy Mode

By default, Highlight will obfuscate any text or input data that matches commonly used Regex expressions and input names of personally identifiable information. This offers a base level protection from recording info such as addresses, phone numbers, social security numbers, and more. It will not obfuscate any images or media content. It is possible that other, non PII text is obfuscated if it matches the expressions for larger number, or contact information on the site. If you want to turn this off, you can set `privacySetting` to `none` when calling [`H.init()`](../../../sdk/client.md#Hinit).

Note: This mode is only available in SDK versions 8.0.0 and later.

Here are a list of the [regex expressions used in default privacy mode](https://github.com/highlight/rrweb/blob/e6a375a554dac9de984a18bfb8ba6e3beb4bd961/packages/rrweb-snapshot/src/utils.ts#L267-L295):
```
Email: "[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*"
SSN: '[0-9]{3}-?[0-9]{2}-?[0-9]{4}'
Phone number: '[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}'
Credit card: '[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}'
Unformatted SSN, phone number, credit card: '[0-9]{9,16}'
Address: '[0-9]{1,5}.?[0-9]{0,3}s[a-zA-Z]{2,30}s[a-zA-Z]{2,15}'
IP address: '(?:[0-9]{1,3}.){3}[0-9]{1,3}'
```

## Strict Privacy Mode

If you don't want to manually annotate what elements to not record then you can set `privacySetting` to `strict` when calling [`H.init()`](../../../sdk/client.md#Hinit). Strict Privacy Mode will obfuscate all text and images. The text obfuscation is not reversible and is done on the client.

Here are some examples:

- `<h1>Hello World</h1>` will be recorded as `<h1>1f0eqo jw02d</h1>`

- `<img src="https://my-secrets.com/secret.png" />` will be recorded as `<img src="" />`

```html
<iframe
  height="500px"
  href="https://xenodochial-benz-c14354.netlify.app/"
  width="100%"
  border="none"
  src="https://xenodochial-benz-c14354.netlify.app/"
  style="border:none"
  ><a href="https://xenodochial-benz-c14354.netlify.app/" target="" title="xenodochial-benz-c14354.netlify.app"
    >null</a
  ></iframe
>
```


