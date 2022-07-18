import { Session } from '@graph/schemas';
import { NetworkResourceWithID } from '@pages/Player/ResourcesContext/ResourcesContext';

export enum SessionPageSearchParams {
    /** Automatically sets the date range for the current segment based on the value. */
    date = 'date',
}

/**
 * Handles rendering the modal within the bounds of the window.
 * @param clickX The X position of where the pointer clicked to create the comment.
 * @param modalWidth The width of the modal.
 */
export const getNewCommentFormCoordinates = (
    modalWidth: number,
    clickX?: number,
    clickY?: number
) => {
    if (clickX === undefined || clickY === undefined) {
        return { left: `${clickX}px`, top: `${clickY}px` };
    }

    const END_PADDING = 32;
    const modalEndXPosition = clickX + modalWidth + END_PADDING;
    let newX = clickX;

    // If the ending edge of the modal is rendered offscreen then mirror the modal so it renders to the left of the clicked position.
    // This is prevent the modal from being rendered offscreen.
    if (modalEndXPosition > window.innerWidth) {
        newX = clickX - modalWidth - 1.5 * END_PADDING;
    }

    return {
        left: `${newX}px`,
        top: `${clickY}px`,
    };
};

const REQUEST_INITIATOR_TYPES = ['xmlhttprequest', 'fetch'];

export const getGraphQLResolverName = (
    resource: NetworkResourceWithID
): null | string => {
    if (!REQUEST_INITIATOR_TYPES.includes(resource.initiatorType)) {
        return null;
    }
    if (!resource.requestResponsePairs) {
        return null;
    }

    try {
        const body = JSON.parse(resource.requestResponsePairs.request.body);

        if ('operationName' in body) {
            return body['operationName'];
        }
    } catch {
        return null;
    }

    return null;
};

export const sessionIsBackfilled = (session?: Session) => {
    // Temporary workaround until we backfill old identified sessions. The
    // default value of `sessions.identified` is `false`, so the check below
    // will return true for records that have not been updated. `client_id` was
    // rolled out at the same time as `identified`.
    if (!session?.client_id) {
        return false;
    }

    return Boolean(session?.identifier) && session?.identified === false;
};
