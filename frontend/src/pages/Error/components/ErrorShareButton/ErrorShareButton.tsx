import { message } from 'antd';
import { Maybe } from 'graphql/jsutils/Maybe';
import React from 'react';

import ShareButton from '../../../../components/Button/ShareButton/ShareButton';
import { ErrorGroup } from '../../../../graph/generated/schemas';

interface Props {
    errorGroup: Maybe<ErrorGroup> | undefined;
}

const ErrorShareButton = ({ errorGroup }: Props) => {
    return (
        <ShareButton
            trackingId="errorShareButton"
            onClick={() => {
                message.success('Copied link!');
                navigator.clipboard.writeText(
                    `${location.origin}/errors/${errorGroup?.id}`
                );
            }}
        />
    );
};

export default ErrorShareButton;
