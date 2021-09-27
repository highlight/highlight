import React from 'react';
import ReactJson, { ReactJsonViewProps } from 'react-json-view';

type Props = {} & Pick<ReactJsonViewProps, 'src' | 'collapsed' | 'name'>;

const JsonViewer = ({ collapsed = 1, name = null, ...props }: Props) => {
    return (
        <ReactJson
            {...props}
            collapsed={collapsed}
            displayDataTypes={false}
            collapseStringsAfterLength={100}
            iconStyle="square"
            quotesOnKeys={false}
            name={name}
            style={{
                wordBreak: 'break-word',
                fontFamily: 'var(--monospace-font-family)',
            }}
        />
    );
};

export default JsonViewer;
