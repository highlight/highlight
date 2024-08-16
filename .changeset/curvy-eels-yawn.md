---
'highlight.run': patch
---

correctly set x-highlight-request on outgoing fetch/xhr requests with duplicate tab recording.
the sessionID in the x-highlight-request would not be set correctly after recent changes
corrected the multi-tab behavior to clear the local storage sessionID value to ensure
new tabs started unique sessions. corrects bug affecting >=9.1.5
