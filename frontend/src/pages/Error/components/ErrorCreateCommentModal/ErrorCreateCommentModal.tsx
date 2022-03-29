import { GetErrorGroupQuery } from '@graph/operations';
import { NewCommentModal } from '@pages/Player/Toolbar/NewCommentModal/NewCommentModal';
import useWindowSize from '@rehooks/window-size';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

interface Props {
    onClose: () => void;
    show?: boolean;
    parentRef?: React.RefObject<HTMLDivElement>;
    data?: GetErrorGroupQuery;
}
export const ErrorCreateCommentModal = ({
    onClose,
    show,
    parentRef,
    data,
}: Props) => {
    const pRef = React.useRef<HTMLDivElement>(null);
    const { error_secure_id } = useParams<{
        error_secure_id: string;
    }>();
    const { innerWidth, innerHeight } = useWindowSize();

    return (
        <NewCommentModal
            mask={true}
            title={'Write a comment'}
            newCommentModalRef={parentRef ?? pRef}
            commentModalPosition={
                show
                    ? {
                          x: innerWidth / 2 - 250,
                          y: innerHeight / 2 - 210,
                      }
                    : undefined
            }
            onCancel={onClose}
            commentTime={0}
            error_secure_id={error_secure_id}
            errorTitle={data?.error_group?.event?.join('')}
        />
    );
};
