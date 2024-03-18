---
title: Tracking Events
slug: tracking-events
createdAt: 2021-09-13T23:23:28.000Z
updatedAt: 2022-03-21T18:25:39.000Z
---

A track event is a named event that you've defined. Adding a track event is useful if you want to be able to be alerted (see [alerts](../../../general/6_product-features/3_general-features/alerts.md)) or [search for sessions](../../../general/6_product-features/1_session-replay/session-search.md#track-searching) where the user has done an action.

## Example Scenario: A Shopping Cart

You'd like to see what users are doing that cause them to open the shopping cart. In your app, you'll add `H.track()`:

```javascript
import { H } from 'highlight.run';
import { getSubtotal } from '@utils';

const ShoppingCard = ({ items }) => (
    <Button
        onClick={() => {
            H.track("Shopping Cart Opened", {
                subtotal: getSubtotal(items),
                numberOfItems: items.length
            });
        }}
    >
        Shopping Cart
    </Button>
)
```

### Searching for Sessions by Event

Once you are recording sessions with the track event, you can search for ones where the event
is recorded by applying the `Event` key in the sessions filter.

![session filter for track event](/images/docs/track-events.png)

Then, within a session, you can view the track events in the timeline and in the right events feed, with the ability to jump to the exact moment the event occurred.

![session filter for track event](/images/docs/track-event-2.png)

## API

See the [Recording Network Requests and Responses](../../../sdk/client.md#Htrack) API documentation for more information on how to use it.
