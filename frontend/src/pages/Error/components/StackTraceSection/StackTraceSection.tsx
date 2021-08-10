import React from 'react';

import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import ErrorPageStyles from '../../ErrorPage.module.scss';
import styles from './StackTraceSection.module.scss';

interface Props {
    errorGroup: Maybe<ErrorGroup> | undefined;
}

const StackTraceSection = ({ errorGroup }: Props) => {
    return (
        <>
            {errorGroup?.stack_trace.map((e, i) => (
                <StackSection
                    key={i}
                    fileName={e?.fileName ?? ''}
                    functionName={e?.functionName ?? ''}
                    lineNumber={e?.lineNumber ?? 0}
                    columnNumber={e?.columnNumber ?? 0}
                />
            ))}
        </>
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
        tokens.length - NUMBER_OF_LEVELS_TO_GO_UP
    )}${tokens.splice(tokens.length - NUMBER_OF_LEVELS_TO_GO_UP).join('/')}`;
};
