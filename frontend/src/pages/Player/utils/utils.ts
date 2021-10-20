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
