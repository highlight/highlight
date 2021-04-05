import { Tooltip } from 'antd';
import React from 'react';
import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import ErrorPageStyles from '../../ErrorPage.module.scss';

interface Props {
    errorGroup: Maybe<ErrorGroup> | undefined;
}

const StackTraceSection = ({ errorGroup }: Props) => {
    return (
        <>
            {errorGroup?.trace.map((e, i) => (
                <StackSection
                    key={i}
                    fileName={e?.file_name ?? ''}
                    functionName={e?.function_name ?? ''}
                    lineNumber={e?.line_number ?? 0}
                    columnNumber={e?.column_number ?? 0}
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
    columnNumber,
}) => {
    const trigger = (
        <Tooltip
            title={`${fileName} in ${functionName} at line ${lineNumber}:${columnNumber}`}
        >
            <div className={ErrorPageStyles.triggerWrapper}>
                <div className={ErrorPageStyles.snippetHeadingTwo}>
                    <span
                        className={ErrorPageStyles.stackTraceErrorTitle}
                        style={{ maxWidth: 300, fontWeight: 300 }}
                    >
                        {fileName}
                    </span>
                    <span style={{ fontWeight: 300, color: '#808080' }}>
                        &nbsp;in&nbsp;
                    </span>
                    <span
                        className={ErrorPageStyles.stackTraceErrorTitle}
                        style={{ maxWidth: 300, fontWeight: 400 }}
                    >
                        {functionName}
                    </span>
                    <span style={{ fontWeight: 300, color: '#808080' }}>
                        &nbsp;at line&nbsp;
                    </span>
                    <span>
                        {lineNumber}:{columnNumber}
                    </span>
                </div>
            </div>
        </Tooltip>
    );
    return (
        <div className={ErrorPageStyles.section}>
            <div className={ErrorPageStyles.collapsible}>{trigger}</div>
        </div>
    );
};
