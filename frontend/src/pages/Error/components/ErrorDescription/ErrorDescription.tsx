import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard';
import { getErrorBody } from '@util/errors/errorUtils';
import React from 'react';

import {
    ErrorGroup,
    ErrorObject,
    Maybe,
} from '../../../../graph/generated/schemas';

interface Props {
    errorGroup: Maybe<Pick<ErrorGroup, 'event'>> | undefined;
    errorObject?: ErrorObject;
}

const ErrorDescription = ({ errorGroup, errorObject }: Props) => {
    const event = errorObject?.event ?? errorGroup?.event;
    const body = getErrorBody(event);
    return (
        <>
            <JsonOrTextCard jsonOrText={body} title={'Description'} />
            {errorObject?.payload && errorObject?.payload !== 'null' && (
                <JsonOrTextCard
                    jsonOrText={errorObject.payload}
                    title={'Context'}
                />
            )}
        </>
    );
};

export default ErrorDescription;
