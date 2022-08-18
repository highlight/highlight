import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard';
import { getErrorGroupMetadata } from '@pages/Error/utils/ErrorPageUtils';
import React, { useMemo, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

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
    const virtuoso = useRef<VirtuosoHandle>(null);
    const fieldsData: KeyValueTableRow[] = useMemo(
        () =>
            getErrorGroupMetadata(errorGroup).map((field) => ({
                keyDisplayValue: field?.name || '',
                renderType: 'string',
                valueDisplayValue: field?.value || '',
            })),
        [errorGroup]
    );

    const contextSection = useMemo(() => {
        if (!errorGroup?.error_group?.metadata_log) {
            return null;
        }
        const meaningfulContext = errorGroup?.error_group?.metadata_log.filter(
            (error) => error?.payload && error?.payload !== 'null'
        );
        if (!meaningfulContext.length) {
            return null;
        }

        return (
            <DataCard title="Context" className={styles.contextSection}>
                <Virtuoso
                    ref={virtuoso}
                    overscan={300}
                    data={meaningfulContext}
                    itemContent={(index, error) => (
                        <JsonOrTextCard
                            jsonOrText={error?.payload || ''}
                            key={index}
                            className={styles.contextCard}
                        />
                    )}
                />
            </DataCard>
        );
    }, [errorGroup?.error_group?.metadata_log]);

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
                    {contextSection}
                </>
            )}
        </div>
    );
};

export default ErrorMetadata;
