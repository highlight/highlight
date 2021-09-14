import { getErrorGroupMetadata } from '@pages/Error/utils/ErrorPageUtils';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import DataCard from '../../../../../../components/DataCard/DataCard';
import KeyValueTable, {
    KeyValueTableRow,
} from '../../../../../../components/KeyValueTable/KeyValueTable';
import { GetErrorGroupQuery } from '../../../../../../graph/generated/operations';

interface Props {
    errorGroup?: GetErrorGroupQuery;
}

const ErrorMetadata = ({ errorGroup }: Props) => {
    const fieldsData: KeyValueTableRow[] = getErrorGroupMetadata(
        errorGroup
    ).map((field) => ({
        keyDisplayValue: field?.name || '',
        renderType: 'string',
        valueDisplayValue: field?.value || '',
    }));

    return (
        <div>
            {!errorGroup ? (
                <Skeleton
                    count={4}
                    height={35}
                    style={{
                        marginTop: 8,
                        marginBottom: 8,
                    }}
                />
            ) : (
                <>
                    <DataCard title="Fields">
                        <KeyValueTable data={fieldsData} />
                    </DataCard>
                </>
            )}
        </div>
    );
};

export default ErrorMetadata;
