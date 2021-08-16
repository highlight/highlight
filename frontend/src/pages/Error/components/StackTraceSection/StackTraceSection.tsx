import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import ErrorPageStyles from '../../ErrorPage.module.scss';
import styles from './StackTraceSection.module.scss';

interface Props {
    errorGroup: Maybe<ErrorGroup> | undefined;
    loading: boolean;
}

const StackTraceSection = ({ errorGroup, loading }: Props) => {
    return (
        <div>
            {loading
                ? Array(5)
                      .fill(0)
                      .map((_, index) => (
                          <Skeleton key={index} className={styles.skeleton} />
                      ))
                : errorGroup?.stack_trace.map((e, i) => (
                      <StackSection
                          key={i}
                          fileName={e?.fileName ?? ''}
                          functionName={e?.functionName ?? ''}
                          lineNumber={e?.lineNumber ?? 0}
                          columnNumber={e?.columnNumber ?? 0}
                      />
                  ))}
        </div>
    );
};

export default StackTraceSection;

type StackSectionProps = {
    fileName?: string;
    functionName?: string;
    lineNumber?: number;
    columnNumber?: number;
};

export const StackSection: React.FC<StackSectionProps> = ({
    fileName,
    functionName,
    lineNumber,
}) => {
    const trigger = (
        <div className={ErrorPageStyles.triggerWrapper}>
            <div className={ErrorPageStyles.snippetHeadingTwo}>
                <span className={ErrorPageStyles.stackTraceErrorTitle}>
                    {truncateFileName(fileName || '')}
                </span>
            </div>
            <hr />
            <div className={styles.editor}>
                <span className={styles.lineNumber}>{lineNumber}</span>
                <span>{functionName}()</span>
            </div>
        </div>
    );
    return (
        <div className={ErrorPageStyles.section}>
            <div className={ErrorPageStyles.collapsible}>{trigger}</div>
        </div>
    );
};

const truncateFileName = (fileName: string) => {
    const NUMBER_OF_LEVELS_TO_GO_UP = 5;
    const tokens = fileName.split('/');

    return `${'../'.repeat(
        Math.max(tokens.length - NUMBER_OF_LEVELS_TO_GO_UP, 0)
    )}${tokens.splice(tokens.length - NUMBER_OF_LEVELS_TO_GO_UP).join('/')}`;
};
