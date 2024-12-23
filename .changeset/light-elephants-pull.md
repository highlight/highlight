---
'highlight.run': patch
---

fix capture of window user interaction events.
the window.addEventListener monkeypatch would
break libraries relying on the API because
the debounce logic would incorrectly call the
listener on the debounce condition.
adds additional events to the instrumentation.
