import { StatelessCollapsible } from '@components/Collapsible/Collapsible';
import CollapsibleStyles from '@components/Collapsible/Collapsible.module.scss';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Tooltip from '@components/Tooltip/Tooltip';
import ErrorSourcePreview from '@pages/Error/components/ErrorSourcePreview/ErrorSourcePreview';
import JsonOrTextCard from '@pages/Error/components/JsonOrTextCard/JsonOrTextCard';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import Alert from '../../../../components/Alert/Alert';
import ButtonLink from '../../../../components/Button/ButtonLink/ButtonLink';
import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import ErrorPageStyles from '../../ErrorPage.module.scss';
import styles from './StackTraceSection.module.scss';

interface Props {
    errorGroup:
        | Maybe<
              Pick<
                  ErrorGroup,
                  | 'stack_trace'
                  | 'mapped_stack_trace'
                  | 'structured_stack_trace'
                  | 'type'
              >
          >
        | undefined;
    loading: boolean;
    compact?: boolean;
}

const StackTraceSection = ({ errorGroup, loading, compact = false }: Props) => {
    /**
     * The length of the longest line number in all the stack frames.
     * We use this to figure out the minimal amount of spacing needed to show all the line numbers.
     */
    const longestLineNumberCharacterLength =
        errorGroup?.structured_stack_trace?.reduce(
            (longestLineNumber, currentStackTrace) => {
                if (
                    currentStackTrace?.lineNumber &&
                    currentStackTrace?.lineNumber?.toString().length >
                        longestLineNumber
                ) {
                    return currentStackTrace?.lineNumber?.toString().length;
                }

                return longestLineNumber;
            },
            0
        ) ?? 0;

    const everyFrameHasError = errorGroup?.structured_stack_trace?.every(
        (frame) =>
            !!frame?.error &&
            !frame.error.includes('file does not contain source map url')
    );

    const showStackFrameNotUseful =
        errorGroup?.type !== 'Backend' &&
        (!errorGroup?.mapped_stack_trace || everyFrameHasError);

    return (
        <div className={styles.stackTraceCard}>
            {showStackFrameNotUseful && !loading && (
                <Alert
                    trackingId="PrivacySourceMapEducation"
                    className={styles.alert}
                    message="These stack frames don't look that useful 😢"
                    type="info"
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
                                href="https://docs.highlight.run/sourcemaps"
                            >
                                Learn More
                            </ButtonLink>
                        </>
                    }
                />
            )}
            {loading ? (
                Array(5)
                    .fill(0)
                    .map((_, index) => (
                        <Skeleton key={index} className={styles.skeleton} />
                    ))
            ) : errorGroup?.structured_stack_trace?.length ? (
                errorGroup?.structured_stack_trace?.map((e, i) => (
                    <StackSection
                        key={i}
                        fileName={e?.fileName ?? ''}
                        functionName={e?.functionName ?? ''}
                        lineNumber={e?.lineNumber ?? 0}
                        columnNumber={e?.columnNumber ?? 0}
                        longestLineNumberCharacterLength={
                            longestLineNumberCharacterLength
                        }
                        lineContent={e?.lineContent ?? undefined}
                        linesBefore={e?.linesBefore ?? undefined}
                        linesAfter={e?.linesAfter ?? undefined}
                        error={e?.error ?? undefined}
                        index={i}
                        compact={compact}
                    />
                ))
            ) : (
                <div className={styles.stackTraceCard}>
                    <JsonOrTextCard
                        jsonOrText={errorGroup?.stack_trace || ''}
                    />
                </div>
            )}
        </div>
    );
};

export default StackTraceSection;

type StackSectionProps = {
    fileName?: string;
    functionName?: string;
    lineNumber?: number;
    columnNumber?: number;
    longestLineNumberCharacterLength?: number;
    lineContent?: string;
    linesBefore?: string;
    linesAfter?: string;
    error?: string;
    index: number;
    compact: boolean;
};

const getErrorMessage = (error: string | undefined): string | undefined => {
    if (!error) {
        return undefined;
    }

    if (error.includes('minified source file over')) {
        return 'Could not load the original source - the source file for this stack frame is over 40MB. This can happen for files which have been combined but have not been minified.';
    }

    if (error.includes('source map file over')) {
        return 'Could not load the original source - the source map file for this stack frame is over 40MB.';
    }

    if (error.includes('error parsing source map file')) {
        return 'Could not load the original source - the source map is not publicly available or the source map file is malformed.';
    }

    return undefined;
};

const StackSection: React.FC<StackSectionProps> = ({
    fileName,
    functionName,
    lineNumber,
    columnNumber,
    longestLineNumberCharacterLength = 5,
    lineContent,
    linesBefore,
    linesAfter,
    error,
    index,
    compact,
}) => {
    const trigger = (
        <div className={ErrorPageStyles.triggerWrapper}>
            <hr />
            {!!lineContent ? (
                <ErrorSourcePreview
                    fileName={fileName}
                    lineNumber={lineNumber}
                    columnNumber={columnNumber}
                    functionName={functionName}
                    lineContent={lineContent}
                    linesBefore={linesBefore}
                    linesAfter={linesAfter}
                />
            ) : (
                <div className={styles.editor}>
                    <span
                        className={styles.lineNumber}
                        style={
                            {
                                '--longest-character-length': longestLineNumberCharacterLength,
                            } as React.CSSProperties
                        }
                    >
                        {lineNumber}
                    </span>
                    <Tooltip mouseEnterDelay={0.1} title={functionName}>
                        <span className={styles.functionName}>
                            {functionName}
                        </span>
                    </Tooltip>
                    <span className={styles.tooltip}>
                        <InfoTooltip
                            size="large"
                            title={getErrorMessage(error)}
                        />
                    </span>
                </div>
            )}
        </div>
    );

    const compactStackTraceTitle = (
        <>
            {truncateFileName(fileName || '', 2)}
            <span className={styles.fillerText}>
                {functionName ? ' | ' : ''}
            </span>
            {functionName}
            <span className={styles.fillerText}>{lineNumber ? ' | ' : ''}</span>
            {lineNumber}
        </>
    );

    const stackTraceTitle = (
        <>
            {truncateFileName(fileName || '')}
            <span className={styles.fillerText}>
                {functionName ? ' in ' : ''}
            </span>
            {functionName}
            <span className={styles.fillerText}>
                {lineNumber ? ' at line ' : ''}
            </span>
            {lineNumber}
        </>
    );

    return (
        <div className={CollapsibleStyles.section}>
            <div className={styles.collapsibleWrapper}>
                {
                    <StatelessCollapsible
                        title={
                            compact ? compactStackTraceTitle : stackTraceTitle
                        }
                        key={index}
                        defaultOpen={index === 0}
                        contentClassName={styles.contentWrapper}
                        stacked={true}
                    >
                        <div className={ErrorPageStyles.collapsible}>
                            {trigger}
                        </div>
                    </StatelessCollapsible>
                }
            </div>
        </div>
    );
};

const truncateFileName = (fileName: string, number_of_levels_to_go_up = 5) => {
    const tokens = fileName.split('/');

    return `${'../'.repeat(
        Math.max(tokens.length - number_of_levels_to_go_up, 0)
    )}${tokens.splice(tokens.length - number_of_levels_to_go_up).join('/')}`;
};
