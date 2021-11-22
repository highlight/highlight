import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

// This is the same as the `NextApiHandler` type, except instead of having a return type of `void | Promise<void>`, it's
// only `Promise<void>`, because wrapped handlers are always async
export type WrappedNextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const withSentry = (origHandler: NextApiHandler): WrappedNextApiHandler => {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return async (req, res) => {
    try {
      const handlerResult = await origHandler(req, res);
      res.finished = true;
      return handlerResult;
    } catch (e) {
      const f = (objectifiedErr) => {
        return callSomething({
          objectifiedErr,
          sessionId,
        });
      };
      f(e);

      // Because we're going to finish and send the transaction before passing the error onto nextjs, it won't yet
      // have had a chance to set the status to 500, so unless we do it ourselves now, we'll incorrectly report that
      // the transaction was error-free
      res.statusCode = 500;
      res.statusMessage = 'Internal Server Error';

      // We rethrow here so that nextjs can do with the error whatever it would normally do. (Sometimes "whatever it
      // would normally do" is to allow the error to bubble up to the global handlers - another reason we need to mark
      // the error as already having been captured.)
      throw e;
    };
  }
};
