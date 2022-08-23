import { getErrorGroupFields } from '@pages/Error/utils/ErrorPageUtils';
import React, { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';

import DataCard from '../../../../../../components/DataCard/DataCard';
import KeyValueTable, {
    KeyValueTableRow,
} from '../../../../../../components/KeyValueTable/KeyValueTable';
import { GetErrorGroupQuery } from '../../../../../../graph/generated/operations';
import styles from './ErrorMetadata.module.scss';

interface Props {
    errorGroup?: GetErrorGroupQuery;
}

const ErrorMetadata = ({ errorGroup }: Props) => {
    const fieldsData: KeyValueTableRow[] = useMemo(
        () =>
            getErrorGroupFields(errorGroup).map((field) => ({
                keyDisplayValue: field?.name || '',
                renderType: 'string',
                valueDisplayValue: field?.value || '',
            })),
        [errorGroup]
    );

    return (
        <div className={styles.metadataContainer}>
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
