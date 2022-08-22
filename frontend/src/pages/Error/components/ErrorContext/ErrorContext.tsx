import Card from '@components/Card/Card';
import { GetRecentErrorsQuery } from '@graph/operations';
import { ErrorObject } from '@graph/schemas';
import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard';
import React, { useMemo, useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import styles from './ErrorContext.module.scss';

interface Props {
    errorGroupData?: GetRecentErrorsQuery;
    errorObject?: ErrorObject;
}

const ErrorContext = ({ errorGroupData, errorObject }: Props) => {
    const virtuoso = useRef<VirtuosoHandle>(null);

    const meaningfulContext = useMemo(() => {
        const metadata: string[] = [];

        const errorGroupMetadata = errorGroupData?.error_group?.metadata_log;
        if (errorObject?.payload) {
            metadata.push(errorObject.payload || '');
        } else if (errorGroupMetadata) {
            for (const error of errorGroupMetadata) {
                metadata.push(error?.payload || '');
            }
        }
        return metadata.filter((payload) => payload && payload !== 'null');
    }, [errorGroupData?.error_group?.metadata_log, errorObject?.payload]);

    if (!meaningfulContext.length) {
        return null;
    }

    return (
        <Card title="Context" className={styles.contextSection}>
            <Virtuoso
                ref={virtuoso}
                overscan={300}
                data={meaningfulContext}
                itemContent={(index, payload) => (
                    <JsonOrTextCard
                        jsonOrText={payload}
                        key={index}
                        className={styles.contextCard}
                    />
                )}
            />
        </Card>
    );
};

export default ErrorContext;
