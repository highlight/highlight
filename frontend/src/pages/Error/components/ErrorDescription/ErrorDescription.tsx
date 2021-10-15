import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard';
import React from 'react';

import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import { parseErrorDescription } from './utils/utils';

interface Props {
    errorGroup: Maybe<Pick<ErrorGroup, 'event'>> | undefined;
}

const ErrorDescription = ({ errorGroup }: Props) => {
    const text = parseErrorDescription(errorGroup?.event);

    return <JsonOrTextCard jsonOrText={text} title={'Error Body'} />;
};

export default ErrorDescription;
