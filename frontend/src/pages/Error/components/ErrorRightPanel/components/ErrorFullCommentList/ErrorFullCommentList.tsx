import { GetErrorGroupQuery } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

import FullCommentList from '../../../../../../components/FullCommentList/FullCommentList';
import { useGetErrorCommentsQuery } from '../../../../../../graph/generated/hooks';
import { MillisToMinutesAndSeconds } from '../../../../../../util/time';
import { ErrorCommentCard } from '../../../ErrorComments/ErrorComments';
import styles from './ErrorFullCommentList.module.scss';

const ErrorFullCommentList = ({
    errorGroup,
}: {
    errorGroup?: GetErrorGroupQuery;
}) => {
    const { error_secure_id } = useParams<{
        error_secure_id: string;
        project_id: string;
    }>();
    const { data: errorCommentsData, loading } = useGetErrorCommentsQuery({
        variables: {
            error_group_secure_id: error_secure_id,
        },
    });

    return (
        <FullCommentList
            loading={loading}
            comments={[...(errorCommentsData?.error_comments || [])].reverse()}
            commentRender={(comment) => (
                <ErrorCommentCard
                    comment={comment}
                    errorGroup={errorGroup}
                    footer={
                        <p className={styles.timestamp}>
                            {MillisToMinutesAndSeconds(comment?.timestamp || 0)}
                        </p>
                    }
                />
            )}
            noCommentsMessage="Need to discuss with your team about this error? Tag them to start a discussion!"
        />
    );
};

export default ErrorFullCommentList;
