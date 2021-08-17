import React from 'react';
import Skeleton from 'react-loading-skeleton';

import Alert from '../../../../components/Alert/Alert';
import ButtonLink from '../../../../components/Button/ButtonLink/ButtonLink';
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
            {!errorGroup?.mapped_stack_trace && !loading && (
                <Alert
                    trackingId="PrivacySourceMapEducation"
                    className={styles.alert}
                    message="These stack frames don't look that useful 😢"
                    description={
                        <>
                            We're guessing you don't ship sourcemaps with your
                            app. Did you know that Highlight has a{' '}
                            <a>CLI tool</a> that you can run during your CI/CD
                            process to upload sourcemaps to Highlight without
                            making them publicly available?
                            <ButtonLink
                                anchor
                                trackingId="stackFrameLearnMoreAboutPrivateSourcemaps"
                                href="https://docs.highlight.run/docs/sending-sourcemaps"
                            >
                                Learn More
                            </ButtonLink>
                        </>
                    }
                />
            )}
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
