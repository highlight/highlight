---
title: Monkey Patches
slug: monkey-patches
createdAt: 2022-01-21T22:53:59.000Z
updatedAt: 2022-01-21T23:09:14.000Z
---

All the data that Highlight collects is provided by running the Highlight snippet on your app. When the Highlight snippet runs, it monkey patches browser APIs in order to record things like:

- Errors

- Console messages

- Network requests

- Changes on the page

Here is a list of all the browser APIs that Highlight monkey patches

- `window.sessionStorage.setItem`

- `window.sessionStorage.getItem`

- `window.sessionStorage.removeItem`

- `window.onerror`

- `window.fetch`

- `window.FontFace`

- `window.scroll`

- `window.scrollTo`

- `window.scrollBy`

- `window.scrollIntoView`

- `window.WebGLRenderingContext`

- `window.WebGL2RenderingContext`

- `window.CanvasRenderingContext2D`

- `window.HTMLCanvasElement`

- `window.CSSStyleSheet.prototype.insertRule`

- `window.CSSStyleSheet.prototype.deleteRule`

- `window.CSSGroupingRule`

- `window.CSSMediaRule`

- `window.CSSConditionRule`

- `window.CSSSuportsRule`

- `window.CSSStyleDeclaration.prototype.setProperty`

- `window.CSSStyleDeclaration.prototype.removeProperty`

- `history.pushState`

- `history.replaceState`

- `XMLHttpRequest.prototype.open`

- `XMLHttpRequest.prototype.setRequestHeader`

- `XMLHttpRequest.prototype.send`

- `console.assert`

- `console.clear`

- `console.count`

- `console.countReset`

- `console.debug`

- `console.dir`

- `console.dirxml`

- `console.error`

- `console.group`

- `console.groupCollapsed`

- `console.groupEnd`

- `console.info`

- `console.log`

- `console.table`

- `console.time`

- `console.timeEnd`

- `console.timeLog`

- `console.trace`

- `console.warn`
