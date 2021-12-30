import * as domain from 'domain';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { H } from '..';

// This is the same as the `NextApiHandler` type, except instead of having a return type of `void | Promise<void>`, it's
// only `Promise<void>`, because wrapped handlers are always async
export type WrappedNextApiHandler = (
    req: NextApiRequest,
    res: NextApiResponse
) => Promise<void>;

export const withHighlight = (
    origHandler: NextApiHandler
): WrappedNextApiHandler => {
    return async (req, res) => {
        try {
            const handlerResult = await origHandler(req, res);

            // Temporarily mark the response as finished, as a hack to get nextjs to not complain that we're coming back
            // from the handler successfully without `res.end()` having completed its work.  This is necessary (and we know
            // we can do it safely) for a few reasons:
            //
            // - Normally, `res.end()` is sync and completes before the request handler returns, as part of the handler
            //   sending data back to the client. As soon as the handler is done, nextjs checks to make sure that the
            //   response is indeed finished. (`res.end()` signals this by setting `res.finished` to `true`.) If it isn't,
            //   nextjs complains. ("Warning: API resolved without sending a response for <url>.")
            //
            // - In order to prevent the lambda running the route handler from shutting down before we can send events to
            //   Sentry, we monkeypatch `res.end()` so that we can call `flush()`, wait for it to finish, and only then
            //   allow the response to be marked complete. This turns the normally-sync `res.end()` into an async function,
            //   which isn't awaited because it's assumed to still be sync. As a result, nextjs runs the aforementioned
            //   check before the now-async `res.end()` has had a chance to set `res.finished = false`, and therefore thinks
            //   there's a problem when there's not.
            //
            // - In order to trick nextjs into not complaining, we can set `res.finished` to `true` before exiting the
            //   handler. If we do that, though, `res.end()` gets mad because it thinks *it* should be the one to get to
            //   mark the response complete. We therefore need to flip it back to `false` 1) after nextjs's check but 2)
            //   before the original `res.end()` is called.
            //
            // - The second part is easy - we control when the original `res.end()` is called, so we can do the flipping
            //   right beforehand and `res.end()` will be none the wiser.
            //
            // - The first part isn't as obvious. How do we know we won't end up with a race condition, such that the
            //   flipping to `false` might happen before the check, negating the entire purpose of this hack? Fortunately,
            //   before it's done, our async `res.end()` wrapper has to await a `setImmediate()` callback, guaranteeing its
            //   run lasts at least until the next event loop. The check, on the other hand, happens synchronously,
            //   immediately after the request handler (so in the same event loop). So as long as we wait to flip
            //   `res.finished` back to `false` until after the `setImmediate` callback has run, we know we'll be safely in
            //   the next event loop when we do so.
            //
            // And with that, everybody's happy: Nextjs doesn't complain about an unfinished response, `res.end()` doesn’t
            // complain about an already-finished response, and we have time to make sure events are flushed to Sentry.
            //
            // One final note: It might seem like making `res.end()` an awaited async function would run the danger of
            // having the lambda close before it's done its thing, meaning we *still* might not get events sent to Sentry.
            // Fortunately, even though it's called `res.end()`, and even though it's normally sync, a) it's far from the
            // end of the request process, so there's other stuff which needs to happen before the lambda can close in any
            // case, and b) that other stuff isn't triggered until `res.end()` emits a `prefinished` event, so even though
            // it's not technically awaited, it's still the case that the process can't go on until it's done.
            //
            // See
            // https://github.com/vercel/next.js/blob/e1464ae5a5061ae83ad015018d4afe41f91978b6/packages/next/server/api-utils.ts#L106-L118
            // and
            // https://github.com/nodejs/node/blob/d8f1823d5fca5e3c00b19530fb15343fdd3c8bf5/lib/_http_outgoing.js#L833-L911.
            res.finished = true;

            return handlerResult;
        } catch (e) {
            if (req.headers && req.headers['x-highlight-request']) {
                const vals = `${req.headers['x-highlight-request']}`.split('/');
                var secureSessionId = '';
                var requestId = '';
                if (vals.length == 2) {
                    secureSessionId = vals[0];
                    requestId = vals[1];
                    if (e instanceof Error)
                        H.consumeError(e, secureSessionId, requestId);
                }
            }

            // Because we're going to finish and send the transaction before passing the error onto nextjs, it won't yet
            // have had a chance to set the status to 500, so unless we do it ourselves now, we'll incorrectly report that
            // the transaction was error-free
            res.statusCode = 500;
            res.statusMessage = 'Internal Server Error';

            // We rethrow here so that nextjs can do with the error whatever it would normally do. (Sometimes "whatever it
            // would normally do" is to allow the error to bubble up to the global handlers - another reason we need to mark
            // the error as already having been captured.)
            throw e;
        }
    };
};

// this code was heavily assisted by https://github.com/getsentry/sentry-javascript/blob/2f2d099dcc668f12109913caf36097f73a1bc966/packages/nextjs/src/utils/withSentry.ts
